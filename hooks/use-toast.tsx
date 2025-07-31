"use client"

import * as React from "react"

interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

interface ToastContextType {
  toast: (props: Toast) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Toast) => {
    console.log("Toast:", props)
    setToasts((prev) => [...prev, { ...props, id: Date.now().toString() }])
  }, [])

  const value = React.useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} setToasts={setToasts} />
    </ToastContext.Provider>
  )
}

// Separate Toaster component
export function Toaster({ 
  toasts, 
  setToasts 
}: { 
  toasts: Toast[]
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>
}) {
  React.useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 3000) // Remove toast after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [toasts, setToasts])

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t, i) => (
        <div
          key={t.id || i}
          className={`p-4 rounded-md shadow-lg text-white ${
            t.variant === "destructive" ? "bg-red-500" : "bg-gray-800"
          }`}
        >
          <h3 className="font-semibold">{t.title}</h3>
          {t.description && <p className="text-sm opacity-90">{t.description}</p>}
        </div>
      ))}
    </div>
  )
}
