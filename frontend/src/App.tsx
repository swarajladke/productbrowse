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
    <div className="min-h-screen bg-[#0B0F19] text-slate-300 flex flex-col font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none -z-10" />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <PackageOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Catalog</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#131826] border border-white/[0.08] text-sm font-medium text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block py-2.5 px-4 pr-10 transition-all hover:bg-[#1A2133] outline-none appearance-none cursor-pointer shadow-sm"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-[90rem] w-full mx-auto p-8 relative z-0">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const isLast = products.length === index + 1;
            return (
              <div 
                ref={isLast ? lastProductElementRef : null}
                key={`${product.id}-${index}`} 
                className="group relative bg-[#131826]/80 hover:bg-[#1A2133] backdrop-blur-sm border border-white/[0.04] hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-500 ease-out flex flex-col gap-4 cursor-pointer overflow-hidden hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-sm">
                    {product.category}
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-emerald-400">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                
                <h3 className="relative z-10 font-medium text-lg text-white leading-snug line-clamp-2 mt-2 group-hover:text-indigo-200 transition-colors duration-300">
                  {product.name}
                </h3>
                
                <div className="relative z-10 mt-auto pt-5 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="bg-black/20 px-2.5 py-1 rounded-md border border-white/[0.05]">ID: {product.id}</span>
                  <span className="flex items-center gap-1.5" title={new Date(product.updated_at).toLocaleString()}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(product.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16 gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
            <span className="text-indigo-400/80 font-medium text-sm animate-pulse">Loading products...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05] mb-6 shadow-2xl">
              <PackageOpen className="w-16 h-16 text-slate-500/50" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">No products found</h2>
            <p className="text-slate-500">Try selecting a different category from the dropdown.</p>
          </div>
        )}
        
        {/* End of list */}
        {!hasMore && products.length > 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-700/50" />
            <span className="px-4 text-slate-500 text-sm font-medium uppercase tracking-wider">End of catalog</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-700/50" />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
