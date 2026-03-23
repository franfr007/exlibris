import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'

export default function BarcodeScanner({ onScan }) {
  const scannerRef = useRef(null)
  const mountedRef = useRef(true)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    mountedRef.current = true
    let scannerInstance = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')

        const container = document.getElementById('barcode-reader')
        if (!container || !mountedRef.current) return

        scannerInstance = new Html5Qrcode('barcode-reader')
        scannerRef.current = scannerInstance

        await scannerInstance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 150 },
            aspectRatio: 1.5,
          },
          (decodedText) => {
            const clean = decodedText.replace(/[-\s]/g, '')
            if (/^\d{10}(\d{3})?$/.test(clean)) {
              if (navigator.vibrate) navigator.vibrate(100)
              onScan(clean)
              try { scannerInstance.stop().catch(() => {}) } catch {}
            }
          },
          () => {}
        )

        if (mountedRef.current) setScanning(true)
      } catch (err) {
        // No logear como error: es esperado en desktop sin cámara
        if (mountedRef.current) {
          setError(
            err.toString().includes('NotAllowed')
              ? 'Permiso de cámara denegado. Habilitalo en la configuración del navegador.'
              : err.toString().includes('NotFound')
                ? 'No se detectó una cámara en este dispositivo.'
                : 'No se pudo iniciar la cámara. Intentá desde el celular.'
          )
        }
      }
    }

    startScanner()

    return () => {
      mountedRef.current = false
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState()
          if (state === 2 || state === 3) {
            scannerRef.current.stop().catch(() => {})
          }
        } catch {}
        try {
          scannerRef.current.clear()
        } catch {}
        scannerRef.current = null
      }
    }
  }, [onScan])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-amber-50 rounded-xl border border-amber-200">
        <CameraOff className="w-12 h-12 text-stone-400" />
        <p className="text-stone-600 text-sm text-center font-body">{error}</p>
        <p className="text-stone-400 text-xs text-center font-body">
          Podés cargar el ISBN manualmente en la pestaña "ISBN"
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative scanner-region">
        <div id="barcode-reader" className="w-full" />
        {!scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
            <Camera className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>
        )}
      </div>
      <p className="text-stone-400 text-xs text-center font-body">
        Apuntá al código de barras del libro
      </p>
    </div>
  )
}
