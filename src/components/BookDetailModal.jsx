import { useState } from 'react'
import { X, BookOpen, Trash2, Star, Edit3, Save, ExternalLink, ShoppingCart } from 'lucide-react'
import { getPriceSearchLinks } from '../lib/bookLookup'

const STATUS_OPTIONS = [
  { value: 'sin_leer', label: '📚 Pendiente', color: 'bg-stone-500' },
  { value: 'leyendo', label: '📖 Leyendo', color: 'bg-amber-600' },
  { value: 'leido', label: '✅ Leído', color: 'bg-green-600' },
]

export default function BookDetailModal({ book, onClose, onUpdate, onDelete, isAdmin }) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    notes: book.notes || '',
    read_status: book.read_status || 'sin_leer',
    rating: book.rating || 0,
  })
  const [imgError, setImgError] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = () => {
    onUpdate(book.id, editData)
    setEditing(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(book.id)
  }

  const handleStatusChange = (status) => {
    const newData = { ...editData, read_status: status }
    setEditData(newData)
    if (!editing && isAdmin) {
      onUpdate(book.id, { read_status: status })
    }
  }

  const handleRating = (stars) => {
    const newData = { ...editData, rating: stars }
    setEditData(newData)
    if (!editing && isAdmin) {
      onUpdate(book.id, { rating: stars })
    }
  }

  const hasCover = book.thumbnail_url && !imgError

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] bg-white border border-stone-200 rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <h2 className="font-display text-xl font-bold text-stone-800 truncate pr-4">{book.title}</h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex gap-5">
            <div className="w-28 sm:w-36 flex-shrink-0">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                {hasCover ? (
                  <img src={book.thumbnail_url} alt={book.title} className="w-full h-full object-cover book-cover" onError={() => setImgError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-amber-50 to-stone-100">
                    <BookOpen className="w-10 h-10 text-stone-300" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-800 leading-tight">{book.title}</h3>
                <p className="text-stone-500 font-body mt-1">{book.authors}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-sm font-body">
                {book.publisher && <InfoRow label="Editorial" value={book.publisher} />}
                {book.published_date && <InfoRow label="Año" value={book.published_date} />}
                {book.page_count && <InfoRow label="Páginas" value={book.page_count} />}
                {book.categories && <InfoRow label="Género" value={book.categories} />}
                {book.language && <InfoRow label="Idioma" value={book.language.toUpperCase()} />}
                {book.price && <InfoRow label="Precio" value={book.price} />}
                {book.isbn && <InfoRow label="ISBN" value={book.isbn} mono />}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <p className="text-stone-400 text-xs font-body uppercase tracking-wider">Estado de lectura</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => isAdmin && handleStatusChange(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-body transition-all ${
                    (editing ? editData.read_status : book.read_status) === opt.value
                      ? `${opt.color} text-white`
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <p className="text-stone-400 text-xs font-body uppercase tracking-wider">Tu calificación</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => isAdmin && handleRating(star)}
                  className={`transition-all ${isAdmin ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                  <Star className={`w-6 h-6 ${
                    star <= (editing ? editData.rating : book.rating || 0)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-stone-200'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          {book.description && (
            <div className="space-y-2">
              <p className="text-stone-400 text-xs font-body uppercase tracking-wider">Descripción</p>
              <p className="text-stone-600 text-sm font-body leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Notas */}
          {isAdmin && (
            <div className="space-y-2">
              <p className="text-stone-400 text-xs font-body uppercase tracking-wider">Notas personales</p>
              {editing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Agregá tus notas sobre este libro..."
                  className="w-full h-24 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 font-body text-sm resize-none"
                />
              ) : (
                <p className="text-stone-500 text-sm font-body italic">{book.notes || 'Sin notas'}</p>
              )}
            </div>
          )}

          {/* Links externos */}
          <div className="space-y-3">
            {/* Buscar precio */}
            <div className="space-y-2">
              <p className="text-stone-400 text-xs font-body uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" />
                Buscar precio
              </p>
              <div className="flex flex-wrap gap-2">
                {getPriceSearchLinks(book.isbn, book.title).map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-lg text-xs font-body text-stone-600 hover:text-amber-700 transition-all"
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>

            {book.isbn && (
              <a
                href={`https://books.google.com/books?vid=isbn${book.isbn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-600 text-sm font-body transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver en Google Books
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        {isAdmin && (
          <div className="flex items-center gap-3 px-5 py-4 border-t border-stone-200 flex-shrink-0 bg-stone-50">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 border border-stone-300 text-stone-500 rounded-xl font-body text-sm hover:text-stone-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-body text-sm font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  className={`px-4 py-2.5 rounded-xl font-body text-sm transition-colors ${
                    confirmDelete
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : 'text-stone-400 hover:text-red-600 border border-stone-200 hover:border-red-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    {confirmDelete ? '¿Confirmar?' : 'Eliminar'}
                  </span>
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-body text-sm font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar notas
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-stone-400 text-xs whitespace-nowrap">{label}:</span>
      <span className={`text-stone-700 truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
