import { BookOpen, Plus, LogOut, Shield, Eye } from 'lucide-react'

export default function Header({ role, logout, stats, isAdmin, onAdd }) {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-700" />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-800 leading-none">
                Ex Libris
              </h1>
              <p className="font-display text-xs sm:text-sm text-stone-400 italic -mt-0.5">
                FFR
              </p>
            </div>
          </div>

          {/* Stats - solo desktop */}
          <div className="hidden md:flex items-center gap-6">
            <StatBadge label="Total" value={stats.total} />
            <StatBadge label="Leídos" value={stats.leido} color="text-green-600" />
            <StatBadge label="Leyendo" value={stats.leyendo} color="text-amber-600" />
            <StatBadge label="Pendientes" value={stats.sin_leer} color="text-stone-500" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg transition-colors font-body text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Agregar libro</span>
              </button>
            )}

            <div className="flex items-center gap-1 px-2 py-1.5 bg-stone-100 rounded-lg border border-stone-200">
              {isAdmin 
                ? <Shield className="w-3.5 h-3.5 text-amber-600" />
                : <Eye className="w-3.5 h-3.5 text-stone-400" />
              }
              <span className="text-xs text-stone-500 font-body">
                {isAdmin ? 'Admin' : 'Invitado'}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats mobile */}
        <div className="flex md:hidden items-center gap-4 pb-3 overflow-x-auto">
          <StatBadge label="Total" value={stats.total} />
          <StatBadge label="Leídos" value={stats.leido} color="text-green-600" />
          <StatBadge label="Leyendo" value={stats.leyendo} color="text-amber-600" />
          <StatBadge label="Pendientes" value={stats.sin_leer} color="text-stone-500" />
        </div>
      </div>
    </header>
  )
}

function StatBadge({ label, value, color = 'text-stone-800' }) {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className={`font-mono text-lg font-bold ${color}`}>{value}</span>
      <span className="text-stone-400 text-xs font-body uppercase tracking-wider">{label}</span>
    </div>
  )
}
