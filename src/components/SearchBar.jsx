import { Search, X } from 'lucide-react'

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'sin_leer', label: 'Pendientes' },
  { value: 'leyendo', label: 'Leyendo' },
  { value: 'leido', label: 'Leídos' },
]

export default function SearchBar({ query, onQueryChange, filterStatus, onFilterChange, resultCount }) {
  return (
    <div className="py-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por título, autor, ISBN, editorial o género..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all font-body shadow-sm"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-body transition-all ${
                filterStatus === f.value
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-stone-400 text-sm font-body whitespace-nowrap">
          {resultCount} libro{resultCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
