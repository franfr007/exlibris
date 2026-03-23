import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './hooks/useAuth'
import PasswordGate from './components/PasswordGate'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import BookGrid from './components/BookGrid'
import AddBookModal from './components/AddBookModal'
import BookDetailModal from './components/BookDetailModal'
import Toast from './components/Toast'

export default function App() {
  const { role, loading: authLoading, login, logout, isAdmin } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({ total: 0, leido: 0, leyendo: 0, sin_leer: 0 })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // Cargar libros
  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBooks(data || [])
      
      // Calcular stats
      const total = data?.length || 0
      const leido = data?.filter(b => b.read_status === 'leido').length || 0
      const leyendo = data?.filter(b => b.read_status === 'leyendo').length || 0
      const sin_leer = data?.filter(b => b.read_status === 'sin_leer').length || 0
      setStats({ total, leido, leyendo, sin_leer })
    } catch (err) {
      console.error('Error cargando libros:', err)
      showToast('Error al cargar la biblioteca', 'error')
    }
    setLoading(false)
  }, [showToast])

  useEffect(() => {
    if (role) fetchBooks()
  }, [role, fetchBooks])

  // Agregar libro
  const addBook = useCallback(async (bookData) => {
    try {
      const { error } = await supabase.from('books').insert([bookData])
      if (error) throw error
      showToast('📚 Libro agregado a la biblioteca')
      fetchBooks()
      setShowAddModal(false)
    } catch (err) {
      console.error('Error agregando libro:', err)
      showToast('Error al agregar el libro', 'error')
    }
  }, [fetchBooks, showToast])

  // Actualizar libro
  const updateBook = useCallback(async (id, updates) => {
    try {
      const { error } = await supabase.from('books').update(updates).eq('id', id)
      if (error) throw error
      showToast('Libro actualizado')
      fetchBooks()
      setSelectedBook(null)
    } catch (err) {
      console.error('Error actualizando:', err)
      showToast('Error al actualizar', 'error')
    }
  }, [fetchBooks, showToast])

  // Eliminar libro
  const deleteBook = useCallback(async (id) => {
    try {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
      showToast('Libro eliminado')
      fetchBooks()
      setSelectedBook(null)
    } catch (err) {
      console.error('Error eliminando:', err)
      showToast('Error al eliminar', 'error')
    }
  }, [fetchBooks, showToast])

  // Filtrar libros
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery === '' || 
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn?.includes(searchQuery) ||
      book.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.categories?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || book.read_status === filterStatus

    return matchesSearch && matchesFilter
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-amber-50/50 flex items-center justify-center">
        <div className="text-stone-400 font-display text-2xl animate-pulse">
          Cargando...
        </div>
      </div>
    )
  }

  if (!role) {
    return <PasswordGate onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-stone-50">
      <Header 
        role={role} 
        logout={logout} 
        stats={stats}
        isAdmin={isAdmin}
        onAdd={() => setShowAddModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SearchBar 
          query={searchQuery} 
          onQueryChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          resultCount={filteredBooks.length}
        />

        <BookGrid 
          books={filteredBooks} 
          loading={loading} 
          onSelectBook={setSelectedBook}
          isAdmin={isAdmin}
        />
      </main>

      {showAddModal && (
        <AddBookModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={addBook}
          showToast={showToast}
        />
      )}

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdate={isAdmin ? updateBook : null}
          onDelete={isAdmin ? deleteBook : null}
          isAdmin={isAdmin}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
