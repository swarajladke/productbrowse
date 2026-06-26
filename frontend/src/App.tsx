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
    <div className="min-h-screen bg-[#F4F5F7] text-gray-800 flex flex-col font-sans">
      {/* Navbar - Envato Style (Clean, White, High Contrast) */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-[#81B441]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">CodeVector Market</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded-md focus:ring-2 focus:ring-[#81B441]/50 focus:border-[#81B441] block py-2 px-4 pr-10 hover:border-gray-400 outline-none appearance-none cursor-pointer shadow-sm transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-8">
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse {category === 'All' ? 'Everything' : category}</h2>
          <p className="text-gray-500 font-medium">Discover premium digital assets created by top developers.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-md mb-8 flex items-center gap-3">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const isLast = products.length === index + 1;
            
            // Generate a stable pastel color based on product ID for the placeholder "image"
            const hue = (product.id * 137.5) % 360;
            const bgColor = `hsl(${hue}, 70%, 90%)`;
            const iconColor = `hsl(${hue}, 60%, 60%)`;

            return (
              <div 
                ref={isLast ? lastProductElementRef : null}
                key={`${product.id}-${index}`} 
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Simulated Image Asset */}
                <div 
                  className="h-48 w-full flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: bgColor }}
                >
                  <PackageOpen className="w-16 h-16 opacity-50 transition-transform duration-500 group-hover:scale-110" style={{ color: iconColor }} />
                  
                  {/* Category Badge overlay on image */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    {product.category}
                  </div>
                </div>
                
                {/* Product Details */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-[#81B441] transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="text-sm text-gray-500 mt-1 mb-4 flex items-center gap-1">
                    <span>by</span>
                    <span className="font-medium text-gray-700 hover:underline">CodeVector Authors</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Last updated {new Date(product.updated_at).toLocaleDateString()}
                    </div>
                    <span className="text-lg font-bold text-[#81B441]">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-[#81B441] animate-spin" />
            <span className="text-gray-500 font-medium text-sm">Loading more assets...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-lg border border-gray-200 mt-4 shadow-sm">
            <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No assets found</h2>
            <p className="text-gray-500">We couldn't find any products in this category.</p>
          </div>
        )}
        
        {/* End of list */}
        {!hasMore && products.length > 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="h-[1px] w-16 bg-gray-200" />
            <span className="px-4 text-gray-400 text-sm font-semibold uppercase tracking-wider">End of Results</span>
            <div className="h-[1px] w-16 bg-gray-200" />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
