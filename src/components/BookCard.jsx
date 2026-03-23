import { useState } from 'react'
import { BookOpen } from 'lucide-react'

const STATUS_COLORS = {
  sin_leer: 'bg-stone-500/80',
  leyendo: 'bg-amber-600/90',
  leido: 'bg-green-600/90',
}

const STATUS_LABELS = {
  sin_leer: 'Pendiente',
  leyendo: 'Leyendo',
  leido: 'Leído',
}

export default function BookCard({ book, onClick, delay = 0 }) {
  const [imgError, setImgError] = useState(false)
  const hasCover = book.thumbnail_url && !imgError

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer animate-fade-in"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-stone-100 border border-stone-200 shadow-sm">
        {hasCover ? (
          <img
            src={book.thumbnail_url}
            alt={book.title}
            className="w-full h-full object-cover book-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-amber-50 to-stone-100 p-3">
            <BookOpen className="w-8 h-8 text-stone-300" />
            <span className="font-display text-sm text-stone-400 text-center leading-tight line-clamp-3">
              {book.title}
            </span>
          </div>
        )}

        {book.read_status && book.read_status !== 'sin_leer' && (
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-body font-medium text-white ${STATUS_COLORS[book.read_status]}`}>
            {STATUS_LABELS[book.read_status]}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
      </div>

      <h3 className="font-display text-sm sm:text-base font-semibold text-stone-800 leading-tight line-clamp-2 group-hover:text-amber-800 transition-colors">
        {book.title}
      </h3>
      <p className="text-stone-500 text-xs sm:text-sm font-body mt-1 line-clamp-1">
        {book.authors || 'Autor desconocido'}
      </p>
      {book.published_date && (
        <p className="text-stone-400 text-xs font-body mt-0.5">
          {book.published_date.substring(0, 4)}
        </p>
      )}
    </div>
  )
}
