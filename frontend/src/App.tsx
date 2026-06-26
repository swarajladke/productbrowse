import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchProducts } from './api'
import type { Product } from './api'
import { Loader2, PackageOpen } from 'lucide-react'

const CATEGORIES = [
  "All", "Electronics", "Books", "Clothing", "Sports", "Furniture",
  "Toys", "Beauty", "Automotive", "Home", "Groceries"
]

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<string>("All")
  const [cursor, setCursor] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)
  
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore])

  const loadInitial = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProducts(category === "All" ? null : category, null, null)
      setProducts(data.products)
      setCursor(data.next_cursor)
      setSnapshot(data.snapshot)
      setHasMore(data.has_more)
    } catch (err: any) {
      setError(err.message || "Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!cursor || !snapshot || loading) return
    setLoading(true)
    try {
      const data = await fetchProducts(category === "All" ? null : category, cursor, snapshot)
      setProducts(prev => [...prev, ...data.products])
      setCursor(data.next_cursor)
      setHasMore(data.has_more)
    } catch (err: any) {
      setError(err.message || "Failed to fetch more products")
    } finally {
      setLoading(false)
    }
  }

  // Reset when category changes
  useEffect(() => {
    loadInitial()
  }, [category])

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageOpen className="w-6 h-6 text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">Catalog</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 transition-all hover:bg-slate-700 outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const isLast = products.length === index + 1;
            return (
              <div 
                ref={isLast ? lastProductElementRef : null}
                key={`${product.id}-${index}`} 
                className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl rounded-2xl p-5 hover:bg-white/10 transition-colors duration-300 flex flex-col gap-3 group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                    {product.category}
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg text-slate-200 line-clamp-2 mt-2 group-hover:text-indigo-300 transition-colors">
                  {product.name}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>ID: {product.id}</span>
                  <span className="truncate ml-2" title={new Date(product.updated_at).toLocaleString()}>
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No products found in this category.</p>
          </div>
        )}
        
        {/* End of list */}
        {!hasMore && products.length > 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            You've reached the end of the catalog.
          </div>
        )}
      </main>
    </div>
  )
}

export default App
