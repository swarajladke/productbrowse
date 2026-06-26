import { useEffect, useState, useRef, useCallback } from 'react'
import { fetchProducts } from './api'
import type { Product } from './api'
import { 
  PackageOpen, Search, Moon, Grid, ArrowRight, Box, Tag, Zap, ShieldCheck, 
  ChevronDown, ArrowUpDown, Clock, CheckCircle2, Database, LayoutTemplate,
  Laptop, BookOpen, Shirt, Dumbbell, Sofa, Gamepad2, Sparkles, Car, Home, ShoppingBag
} from 'lucide-react'

const CATEGORIES = [
  "All", "Electronics", "Books", "Clothing", "Sports", "Furniture",
  "Toys", "Beauty", "Automotive", "Home", "Groceries"
]

// Icon mapping for fake images
const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const props = { className: className || "w-8 h-8 opacity-70" };
  switch(category) {
    case "Electronics": return <Laptop {...props} />;
    case "Books": return <BookOpen {...props} />;
    case "Clothing": return <Shirt {...props} />;
    case "Sports": return <Dumbbell {...props} />;
    case "Furniture": return <Sofa {...props} />;
    case "Toys": return <Gamepad2 {...props} />;
    case "Beauty": return <Sparkles {...props} />;
    case "Automotive": return <Car {...props} />;
    case "Home": return <Home {...props} />;
    case "Groceries": return <ShoppingBag {...props} />;
    default: return <PackageOpen {...props} />;
  }
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<string>("All")
  const [cursor, setCursor] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedCount, setLoadedCount] = useState<number>(0)

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
      setLoadedCount(data.products.length)
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
      setLoadedCount(prev => prev + data.products.length)
    } catch (err: any) {
      setError(err.message || "Failed to fetch more products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitial()
  }, [category])

  return (
    <div className="min-h-screen bg-[#090C15] text-slate-300 flex flex-col font-sans selection:bg-[#10B981]/30">
      

      {/* Hero Section */}
      <section className="relative w-full max-w-[1400px] mx-auto px-6 pt-16 pb-12 overflow-hidden border-b border-white/[0.05]">
        {/* Subtle background glow lines representing the mockup's background art */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#10B981]/5 via-[#8B5CF6]/5 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="text-[#10B981]">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">ProductVault</h1>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold tracking-wide mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              200,000+ Products Available
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Discover. <span className="text-[#10B981]">Browse.</span> <span className="text-[#8B5CF6]">Buy.</span>
            </h2>
            
            <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
              Explore premium products across 10+ categories with lightning-fast search and seamless experience.
            </p>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  setCategory('All');
                  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#0EA5E9]/90 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
              >
                Browse All Products <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  document.getElementById('category-select')?.focus();
                  document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 bg-[#131826] hover:bg-[#1A2133] border border-white/[0.05] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                View Categories <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#131826]/80 backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20">
                <Box className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">200,000+</h3>
              <p className="text-sm text-slate-500">Products</p>
            </div>
            
            <div className="bg-[#131826]/80 backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                <Tag className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">10+</h3>
              <p className="text-sm text-slate-500">Categories</p>
            </div>
            
            <div className="bg-[#131826]/80 backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">99.9%</h3>
              <p className="text-sm text-slate-500">Uptime</p>
            </div>
            
            <div className="bg-[#131826]/80 backdrop-blur-sm border border-white/[0.05] rounded-xl p-6 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">0</h3>
              <p className="text-sm text-slate-500">Duplicates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="product-grid" className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-8 scroll-mt-24">
        
        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative hidden sm:block">
              <select 
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#131826] border border-white/[0.05] text-sm font-medium text-slate-200 rounded-lg block py-2.5 pl-10 pr-10 hover:bg-[#1A2133] outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#10B981]"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
              <LayoutTemplate className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="relative w-full sm:w-auto">
            <select className="w-full bg-[#131826] border border-white/[0.05] text-sm font-medium text-slate-200 rounded-lg block py-2.5 pl-10 pr-10 hover:bg-[#1A2133] outline-none appearance-none cursor-pointer">
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl mb-8 flex items-center gap-3">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Infinite Scroll Visual Representation (Matches mockup footer pagination) */}
        <div className="flex items-center justify-between gap-2 mb-8">
          <button disabled className="px-4 py-2 bg-transparent text-slate-600 text-sm font-medium rounded-lg cursor-not-allowed flex items-center gap-2 border border-transparent">
            ← Previous
          </button>
          
          <div className="hidden sm:flex items-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center bg-[#10B981] text-white font-medium rounded-lg">1</div>
            <div className="w-10 h-10 flex items-center justify-center hover:bg-[#1A2133] text-slate-400 font-medium rounded-lg cursor-pointer transition-colors">2</div>
            <div className="w-10 h-10 flex items-center justify-center hover:bg-[#1A2133] text-slate-400 font-medium rounded-lg cursor-pointer transition-colors">3</div>
            <div className="w-10 h-10 flex items-center justify-center text-slate-600 font-medium">...</div>
            <div className="w-10 h-10 flex items-center justify-center hover:bg-[#1A2133] text-slate-400 font-medium rounded-lg cursor-pointer flex-col leading-none transition-colors">
              <span className="text-[10px]">Page</span>
              <span>∞</span>
            </div>
          </div>
          
          {hasMore ? (
            <button 
              onClick={loadMore}
              disabled={loading}
              className="px-4 py-2 bg-transparent hover:bg-[#1A2133] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-white/[0.05]"
            >
              Load Next →
            </button>
          ) : (
             <span className="px-4 py-2 text-slate-500 text-sm border border-transparent">End of results</span>
          )}
        </div>

        {/* Product Grid (Horizontal Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product, index) => {
            const isLast = products.length === index + 1;
            
            // Generate a color hue for the placeholder image based on ID
            const hue = (product.id * 137.5) % 360;
            const bgGradient = `linear-gradient(135deg, hsl(${hue}, 40%, 15%), hsl(${hue}, 60%, 8%))`;
            
            return (
              <div 
                ref={isLast ? lastProductElementRef : null}
                key={`${product.id}-${index}`} 
                className="group flex bg-[#131826]/80 hover:bg-[#1A2133] border border-white/[0.04] hover:border-white/[0.1] rounded-xl overflow-hidden transition-all duration-300 cursor-pointer min-h-[170px]"
              >
                {/* Left Side: Simulated Image */}
                <div 
                  className="w-1/3 min-w-[120px] max-w-[140px] h-full flex flex-col items-center justify-center relative border-r border-white/[0.02]"
                  style={{ background: bgGradient }}
                >
                  <CategoryIcon category={product.category} className="w-10 h-10 text-white/50 group-hover:scale-110 group-hover:text-white/80 transition-all duration-500" />
                  
                  {/* Overlay reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                </div>
                
                {/* Right Side: Product Details */}
                <div className="p-4 flex flex-col flex-1 relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase tracking-wider">
                      {product.category}
                    </span>
                    {/* Fake favorite heart icon */}
                    <button className="text-slate-500 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-base text-white leading-snug line-clamp-2 mb-1.5 group-hover:text-[#10B981] transition-colors pr-2">
                    {product.name}
                  </h3>
                  
                  <div className="text-xs text-slate-500 mb-3">
                    by <span className="text-slate-400 font-medium hover:text-white transition-colors">ProductVault</span>
                  </div>
                  
                  <div className="text-lg font-bold text-[#10B981] mt-auto">
                    ${product.price.toFixed(2)}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5" title={new Date(product.updated_at).toLocaleString()}>
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      ID: {product.id}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        


      </main>

      {/* Tech Stack Footer (Matches Mockup) */}
      <footer id="footer" className="w-full border-t border-white/[0.05] bg-[#090C15] mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Cursor Pagination</p>
                <p className="text-[11px] text-slate-500">Fast & Efficient</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Snapshot Consistency</p>
                <p className="text-[11px] text-slate-500">No duplicates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">PostgreSQL</p>
                <p className="text-[11px] text-slate-500">Powered</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">FastAPI</p>
                <p className="text-[11px] text-slate-500">High Performance</p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{products.length > 0 ? 1 : 0} - {loadedCount}</span> of 200,000+ products
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
