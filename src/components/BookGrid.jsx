import BookCard from './BookCard'
import { BookOpen } from 'lucide-react'

export default function BookGrid({ books, loading, onSelectBook }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="skeleton aspect-[2/3] rounded-lg mb-3" />
            <div className="skeleton h-4 w-3/4 mb-2" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <BookOpen className="w-16 h-16 text-stone-300 mb-4" />
        <p className="font-display text-2xl text-stone-400 italic">
          No se encontraron libros
        </p>
        <p className="text-stone-400 text-sm font-body mt-2">
          Agregá tu primer libro con el botón de arriba
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {books.map((book, i) => (
        <BookCard 
          key={book.id} 
          book={book} 
          onClick={() => onSelectBook(book)}
          delay={i * 30}
        />
      ))}
    </div>
  )
}
