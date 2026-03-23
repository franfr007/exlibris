const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || ''

/**
 * Busca un libro por ISBN en Google Books + Open Library
 */
export async function lookupByISBN(isbn) {
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  const [googleResult, openLibResult] = await Promise.allSettled([
    fetchGoogleBooks(`isbn:${cleanISBN}`),
    fetchOpenLibrary(cleanISBN),
  ])

  const google = googleResult.status === 'fulfilled' ? googleResult.value : null
  const openLib = openLibResult.status === 'fulfilled' ? openLibResult.value : null

  if (!google && !openLib) return null

  // Merge datos
  const merged = mergeResults(google, openLib, cleanISBN)

  // Buscar la mejor portada validando que sea real
  merged.thumbnail_url = await findBestCover(cleanISBN, google, openLib)

  return merged
}

/**
 * Busca libros por título/autor en Google Books
 */
export async function lookupByQuery(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&country=AR${GOOGLE_API_KEY ? '&key=' + GOOGLE_API_KEY : ''}`
  
  try {
    const res = await fetch(url)
    const json = await res.json()
    
    if (!json.items || json.items.length === 0) return []

    return json.items.map(item => {
      const v = item.volumeInfo || {}
      const s = item.saleInfo || {}
      return {
        isbn: extractISBN(v.industryIdentifiers),
        title: v.title || 'Sin título',
        authors: v.authors ? v.authors.join(', ') : 'Autor desconocido',
        published_date: v.publishedDate || null,
        page_count: v.pageCount || null,
        publisher: v.publisher || null,
        categories: v.categories ? v.categories.join(', ') : null,
        price: formatPrice(s),
        thumbnail_url: getBestThumbnail(v.imageLinks),
        description: v.description || null,
        language: v.language || null,
        source: 'google_books',
        selfLink: item.selfLink,
      }
    })
  } catch (err) {
    console.error('Error buscando por query:', err)
    return []
  }
}

/**
 * Genera links de búsqueda de precio para librerías argentinas
 */
export function getPriceSearchLinks(isbn, title) {
  const q = encodeURIComponent(isbn || title || '')
  const titleQ = encodeURIComponent(title || '')
  return [
    { name: 'Buscalibre', url: `https://www.buscalibre.com.ar/libros/search?q=${q}` },
    { name: 'Cúspide', url: `https://www.cuspide.com/Resultados.aspx?c=${q}` },
    { name: 'Tematika', url: `https://www.tematika.com/buscar?q=${q}` },
    { name: 'MercadoLibre', url: `https://listado.mercadolibre.com.ar/${titleQ.replace(/%20/g, '-')}` },
  ]
}

// ==========================================
// PORTADAS - Búsqueda en múltiples fuentes
// ==========================================

/**
 * Intenta encontrar la mejor portada probando varias fuentes.
 * Orden de prioridad:
 * 1. Bookcover API (longitood.com) - agrega de Amazon, Open Library, etc.
 * 2. Bookcover API por título + autor (si ISBN no encontró)
 * 3. Open Library por cover ID
 * 4. Open Library por ISBN
 * 5. Google Books (solo si devolvió imageLinks reales)
 */
async function findBestCover(isbn, googleData, openLibData) {
  // 1. Bookcover API por ISBN - fuente más completa (Goodreads/Amazon)
  try {
    const bcRes = await fetch(`https://bookcover.longitood.com/bookcover/${isbn}`)
    if (bcRes.ok) {
      const bcData = await bcRes.json()
      if (bcData.url && !bcData.url.includes('placeholder')) {
        const isValid = await validateCoverUrl(bcData.url)
        if (isValid) return bcData.url
      }
    }
  } catch {}

  // 2. Bookcover API por título + autor (fallback si ISBN no encontró)
  const title = googleData?.title || openLibData?.title
  const authors = googleData?.authors || openLibData?.authors
  if (title && authors) {
    try {
      const authorFirst = authors.split(',')[0].trim()
      const bcUrl = `https://bookcover.longitood.com/bookcover?book_title=${encodeURIComponent(title)}&author_name=${encodeURIComponent(authorFirst)}`
      const bcRes = await fetch(bcUrl)
      if (bcRes.ok) {
        const bcData = await bcRes.json()
        if (bcData.url && !bcData.url.includes('placeholder')) {
          const isValid = await validateCoverUrl(bcData.url)
          if (isValid) return bcData.url
        }
      }
    } catch {}
  }

  // 3-5. Fallbacks por imagen directa
  const candidates = []

  // Open Library por cover ID (si devolvió covers explícitamente)
  if (openLibData?.thumbnail_url) {
    candidates.push(openLibData.thumbnail_url.replace('-M.jpg', '-L.jpg'))
    candidates.push(openLibData.thumbnail_url)
  }

  // Open Library por ISBN directo
  candidates.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`)

  // Google Books - solo si la API devolvió imageLinks reales
  if (googleData?.thumbnail_url) {
    const highRes = googleData.thumbnail_url
      .replace('zoom=1', 'zoom=2')
      .replace('&edge=curl', '')
    candidates.push(highRes)
    candidates.push(googleData.thumbnail_url)
  }

  for (const url of candidates) {
    const isValid = await validateCoverUrl(url)
    if (isValid) return url
  }

  return null
}

/**
 * Valida que una URL de portada sea una imagen real.
 * Descarta placeholders por dimensiones.
 */
async function validateCoverUrl(url) {
  return new Promise((resolve) => {
    const img = new Image()
    
    const timeout = setTimeout(() => {
      img.src = ''
      resolve(false)
    }, 5000)

    img.onload = () => {
      clearTimeout(timeout)
      const w = img.naturalWidth
      const h = img.naturalHeight
      
      // Descartar imágenes muy pequeñas (placeholders de 1x1)
      if (w <= 10 || h <= 10) {
        resolve(false)
        return
      }

      // Placeholders de Google Books: exactamente ~128x188/196
      const isGoogleUrl = url.includes('books.google.com') || url.includes('googleapis.com')
      if (isGoogleUrl && w <= 130 && h <= 200) {
        resolve(false)
        return
      }

      resolve(w > 50 && h > 80)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }

    img.src = url
  })
}

// ==========================================
// APIs individuales
// ==========================================

async function fetchGoogleBooksDetail(selfLink) {
  try {
    const url = selfLink + (GOOGLE_API_KEY ? '?key=' + GOOGLE_API_KEY : '')
    const res = await fetch(url)
    return await res.json()
  } catch {
    return null
  }
}

async function fetchGoogleBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&country=AR${GOOGLE_API_KEY ? '&key=' + GOOGLE_API_KEY : ''}`
  
  try {
    const res = await fetch(url)
    const json = await res.json()
    
    if (!json.items || json.items.length === 0) return null

    const item = json.items[0]
    const detail = await fetchGoogleBooksDetail(item.selfLink)
    const v = detail ? detail.volumeInfo : item.volumeInfo
    const s = detail ? detail.saleInfo : item.saleInfo || {}

    return {
      isbn: extractISBN(v.industryIdentifiers),
      title: v.title || null,
      authors: v.authors ? v.authors.join(', ') : null,
      published_date: v.publishedDate || null,
      page_count: v.pageCount || null,
      publisher: v.publisher || null,
      categories: v.categories ? v.categories.join(', ') : null,
      price: formatPrice(s),
      thumbnail_url: getBestThumbnail(v.imageLinks),
      description: v.description || null,
      language: v.language || null,
      source: 'google_books',
    }
  } catch (err) {
    console.error('Error Google Books:', err)
    return null
  }
}

async function fetchOpenLibrary(isbn) {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`)
    if (!res.ok) return null
    const data = await res.json()

    let authorName = null
    if (data.authors && data.authors.length > 0) {
      try {
        const authorRes = await fetch(`https://openlibrary.org${data.authors[0].key}.json`)
        const authorData = await authorRes.json()
        authorName = authorData.name || null
      } catch {}
    }

    let categories = null
    if (data.works && data.works.length > 0) {
      try {
        const workRes = await fetch(`https://openlibrary.org${data.works[0].key}.json`)
        const workData = await workRes.json()
        if (workData.subjects) {
          categories = workData.subjects.slice(0, 3).join(', ')
        }
      } catch {}
    }

    let thumbnail = null
    if (data.covers && data.covers.length > 0) {
      thumbnail = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
    }

    return {
      isbn: isbn,
      title: data.title || null,
      authors: authorName,
      published_date: data.publish_date || null,
      page_count: data.number_of_pages || null,
      publisher: data.publishers ? data.publishers.join(', ') : null,
      categories: categories,
      price: null,
      thumbnail_url: thumbnail,
      description: typeof data.description === 'string' 
        ? data.description 
        : data.description?.value || null,
      language: data.languages ? data.languages[0]?.key?.replace('/languages/', '') : null,
      source: 'open_library',
    }
  } catch (err) {
    console.error('Error Open Library:', err)
    return null
  }
}

function mergeResults(google, openLib, isbn) {
  const base = google || {}
  const fallback = openLib || {}

  return {
    isbn: base.isbn || fallback.isbn || isbn,
    title: base.title || fallback.title || 'Sin título',
    authors: base.authors || fallback.authors || 'Autor desconocido',
    published_date: base.published_date || fallback.published_date || null,
    page_count: base.page_count || fallback.page_count || null,
    publisher: base.publisher || fallback.publisher || null,
    categories: base.categories || fallback.categories || null,
    price: base.price || fallback.price || null,
    thumbnail_url: null, // se resuelve en findBestCover
    description: base.description || fallback.description || null,
    language: base.language || fallback.language || null,
    source: google ? 'google_books' : 'open_library',
  }
}

// --- Helpers ---

function extractISBN(identifiers) {
  if (!identifiers) return null
  const isbn13 = identifiers.find(id => id.type === 'ISBN_13')
  return isbn13 ? isbn13.identifier : identifiers[0]?.identifier || null
}

function getBestThumbnail(imageLinks) {
  if (!imageLinks) return null
  const url = imageLinks.medium || imageLinks.small || imageLinks.thumbnail || imageLinks.smallThumbnail || null
  return url ? url.replace('http://', 'https://') : null
}

function formatPrice(saleInfo) {
  if (!saleInfo) return null
  const price = saleInfo.listPrice || saleInfo.retailPrice
  if (!price) return null
  return `${price.amount} ${price.currencyCode}`
}
