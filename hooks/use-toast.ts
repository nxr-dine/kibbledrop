"use client"

// This is a placeholder for the shadcn/ui useToast hook.
// In a real project, you would import it from "@/components/ui/use-toast".
// For the v0 preview, we'll provide a minimal mock.
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

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  React.useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1))
      }, 3000) // Remove toast after 3 seconds
      return () => clearTimeout(timer)
    }
  }, [toasts])

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t, i) => (
        <div
          key={i}
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

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = React.useCallback((props: Toast) => {
    // In a real app, this would trigger the shadcn/ui toast component
    // For this mock, we'll just log and add to a local state for display
    console.log("Toast:", props)
    // This part is handled by the Toaster component above, which is a simplified mock
  }, [])

  const value = React.useMemo(() => ({ toast }), [toast])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
