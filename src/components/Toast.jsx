import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = 'success' }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] toast-enter">
      <div className={`flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-body text-sm ${
        type === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-white text-stone-700 border border-stone-200'
      } backdrop-blur-sm`}>
        {type === 'error' 
          ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
          : <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-600" />
        }
        {message}
      </div>
    </div>
  )
}
