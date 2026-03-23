import { useState, useCallback } from 'react'
import { X, Camera, Hash, Search, Loader2, Check, BookOpen, ChevronRight } from 'lucide-react'
import BarcodeScanner from './BarcodeScanner'
import { lookupByISBN, lookupByQuery } from '../lib/bookLookup'

const TABS = [
  { id: 'scan', label: 'Escanear', icon: Camera },
  { id: 'isbn', label: 'ISBN', icon: Hash },
  { id: 'search', label: 'Buscar', icon: Search },
]

export default function AddBookModal({ onClose, onAdd, showToast }) {
  const [activeTab, setActiveTab] = useState('scan')
  const [isbnInput, setIsbnInput] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [preview, setPreview] = useState(null)

  const handleISBNLookup = useCallback(async (isbn) => {
    setLoading(true)
    setPreview(null)
    setSearchResults([])

    try {
      const result = await lookupByISBN(isbn)
      if (result) {
        setPreview(result)
      } else {
        showToast('No se encontró el libro con ese ISBN', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error al buscar el libro', 'error')
    }
    setLoading(false)
  }, [showToast])

  const handleSearch = useCallback(async () => {
    if (!searchInput.trim()) return
    setLoading(true)
    setPreview(null)
    setSearchResults([])

    try {
      const results = await lookupByQuery(searchInput)
      if (results.length > 0) {
        setSearchResults(results)
      } else {
        showToast('No se encontraron resultados', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error en la búsqueda', 'error')
    }
    setLoading(false)
  }, [searchInput, showToast])

  const handleSelectResult = useCallback(async (result) => {
    if (result.isbn) {
      setLoading(true)
      const full = await lookupByISBN(result.isbn)
      setPreview(full || result)
      setLoading(false)
    } else {
      setPreview(result)
    }
    setSearchResults([])
  }, [])

  const handleConfirm = () => {
    if (!preview) return
    onAdd({
      isbn: preview.isbn || null,
      title: preview.title,
      authors: preview.authors,
      published_date: preview.published_date,
      page_count: preview.page_count,
      publisher: preview.publisher,
      categories: preview.categories,
      price: preview.price,
      thumbnail_url: preview.thumbnail_url,
      description: preview.description,
      language: preview.language,
      source: preview.source || 'manual',
      read_status: 'sin_leer',
    })
  }

  const handleReset = () => {
    setPreview(null)
    setSearchResults([])
    setIsbnInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg max-h-[90vh] bg-white border border-stone-200 rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="font-display text-xl font-bold text-stone-800">Agregar libro</h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {!preview && (
          <div className="flex border-b border-stone-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchResults([]); setPreview(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-body transition-all ${
                  activeTab === tab.id
                    ? 'text-amber-700 border-b-2 border-amber-600'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {preview ? (
            <BookPreview book={preview} onConfirm={handleConfirm} onReset={handleReset} />
          ) : loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              <p className="text-stone-400 text-sm font-body">Buscando...</p>
            </div>
          ) : (
            <>
              {activeTab === 'scan' && (
                <BarcodeScanner onScan={handleISBNLookup} />
              )}

              {activeTab === 'isbn' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      value={isbnInput}
                      onChange={(e) => setIsbnInput(e.target.value.replace(/[^0-9-]/g, ''))}
                      placeholder="978-3-16-148410-0"
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono text-lg"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && isbnInput.trim() && handleISBNLookup(isbnInput)}
                    />
                  </div>
                  <button
                    onClick={() => handleISBNLookup(isbnInput)}
                    disabled={!isbnInput.trim()}
                    className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl transition-colors font-body font-medium"
                  >
                    Buscar ISBN
                  </button>
                </div>
              )}

              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Título o autor..."
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-body text-lg"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchInput.trim()}
                    className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl transition-colors font-body font-medium"
                  >
                    Buscar
                  </button>

                  {searchResults.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-stone-400 text-xs font-body uppercase tracking-wider">
                        {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                      </p>
                      {searchResults.map((result, i) => (
                        <SearchResultItem
                          key={i}
                          result={result}
                          onClick={() => handleSelectResult(result)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchResultItem({ result, onClick }) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl transition-all text-left group"
    >
      <div className="w-10 h-14 flex-shrink-0 rounded bg-stone-100 overflow-hidden">
        {result.thumbnail_url && !imgError ? (
          <img src={result.thumbnail_url} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-stone-300" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-stone-800 text-sm font-body font-medium truncate">{result.title}</p>
        <p className="text-stone-500 text-xs font-body truncate">{result.authors}</p>
        {result.published_date && (
          <p className="text-stone-400 text-xs font-body">{result.published_date.substring(0, 4)}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors flex-shrink-0" />
    </button>
  )
}

function BookPreview({ book, onConfirm, onReset }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex gap-4">
        <div className="w-24 sm:w-28 flex-shrink-0">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
            {book.thumbnail_url && !imgError ? (
              <img src={book.thumbnail_url} alt={book.title} className="w-full h-full object-cover book-cover" onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-stone-300" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-display text-lg font-bold text-stone-800 leading-tight">{book.title}</h3>
          <p className="text-stone-500 text-sm font-body">{book.authors}</p>
          <div className="space-y-1 text-xs font-body text-stone-500">
            {book.publisher && <p>📕 {book.publisher}</p>}
            {book.published_date && <p>📅 {book.published_date}</p>}
            {book.page_count && <p>📄 {book.page_count} páginas</p>}
            {book.categories && <p>🏷️ {book.categories}</p>}
            {book.isbn && <p className="font-mono text-stone-400">ISBN: {book.isbn}</p>}
            {book.price && <p>💲 {book.price}</p>}
          </div>
        </div>
      </div>

      {book.description && (
        <p className="text-stone-500 text-sm font-body leading-relaxed line-clamp-4">{book.description}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onReset}
          className="flex-1 py-3 border border-stone-300 text-stone-500 hover:text-stone-700 hover:border-stone-400 rounded-xl transition-colors font-body text-sm"
        >
          Buscar otro
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl transition-colors font-body font-medium text-sm shadow-sm"
        >
          <Check className="w-4 h-4" />
          Agregar a biblioteca
        </button>
      </div>
    </div>
  )
}
