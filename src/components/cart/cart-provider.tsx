'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type CartLine = {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  variantLabel: string
  unitPrice: number
  image: string | null
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  addItem: (line: Omit<CartLine, 'quantity'>, qty?: number) => void
  setQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'ybb_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setLines(JSON.parse(raw) as CartLine[])
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines, ready])

  const addItem = useCallback((line: Omit<CartLine, 'quantity'>, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId)
      if (existing) {
        return prev.map((l) =>
          l.variantId === line.variantId
            ? { ...l, quantity: l.quantity + qty }
            : l
        )
      }
      return [...prev, { ...line, quantity: qty }]
    })
  }, [])

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.variantId !== variantId)
      return prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l))
    })
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const itemCount = lines.reduce((n, l) => n + l.quantity, 0)
    const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0)
    return { lines, itemCount, subtotal, addItem, setQuantity, removeItem, clear }
  }, [lines, addItem, setQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
