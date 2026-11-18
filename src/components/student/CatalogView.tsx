import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const CatalogView: React.FC = () => {
  const { products, addToCartStationery, notifications, isLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAdd = (product: Product) => {
    if (!product.inStock) return;
    addToCartStationery(product, 1);
    setAddedItemNotice(product.id);
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Campus Notice Banner */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.slice(0, 2).map((notif) => (
            <div
              key={notif.notificationId}
              className={`p-3 border flex items-start space-x-2.5 text-xs ${
                notif.notificationType === 'ANNOUNCEMENT'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : 'bg-brand-light border-brand-primary/40 text-brand-dark'
              }`}
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-brand-primary" />
              <div>
                <strong className="font-semibold">{notif.notificationType}:</strong> {notif.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero / Header Section */}
      <div className="border border-paper-border bg-paper-surface p-5 sm:p-6 mb-6 shadow-paper">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              Campus Stationery Pre-Order
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Select essentials online, pick your interval slot, and collect directly at the counter.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebooks, pens, sheets..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper-warm border border-paper-borderStrong text-ink focus:outline-none focus:border-brand-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-paper-border text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 whitespace-nowrap transition-colors font-medium border ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white border-brand-deep font-semibold shadow-sm'
                  : 'bg-paper-warm text-ink-muted border-paper-border hover:bg-paper-muted hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-ink-muted">
          Loading catalog from data repository...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border border-paper-border bg-paper-surface p-8 text-center text-ink-muted">
          <p className="text-sm font-semibold">No stationery items found</p>
          <p className="text-xs text-ink-faint mt-1">Try modifying your search query or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isJustAdded = addedItemNotice === product.id;

            return (
              <div
                key={product.id}
                className="bg-paper-surface border border-paper-border p-4 flex flex-col justify-between hover:border-paper-borderStrong transition-all shadow-paper"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted bg-paper-warm px-1.5 py-0.5 border border-paper-border">
                      {product.category}
                    </span>
                    {product.inStock ? (
                      <span className="text-[10px] font-semibold text-brand-primary bg-brand-light px-1.5 py-0.5 border border-brand-primary/30">
                        IN STOCK ({product.stockCount})
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 border border-red-200">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-ink leading-snug mt-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-ink">₹{product.price}</span>
                    <span className="text-[11px] text-ink-muted ml-1">/ {product.unit}</span>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    disabled={!product.inStock}
                    className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold transition-all border ${
                      !product.inStock
                        ? 'bg-paper-muted text-ink-faint border-paper-border cursor-not-allowed'
                        : isJustAdded
                        ? 'bg-brand-deep text-white border-brand-deep'
                        : 'bg-brand-primary text-white border-brand-deep hover:bg-brand-deep'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Sticky Mobile Order Bar */}
      <div className="mt-8 p-4 bg-paper-warm border border-paper-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-ink">Need custom printing or photocopies?</span>
          <span className="text-ink-muted ml-1">Upload to Google Drive and paste the link in our Print Order tool.</span>
        </div>
        <a
          href="#/print"
          className="px-4 py-2 bg-paper-surface hover:bg-paper-muted border border-paper-borderStrong text-ink font-semibold flex items-center space-x-1.5 whitespace-nowrap"
        >
          <ShoppingCart className="w-3.5 h-3.5 text-brand-primary" />
          <span>Configure Printout Job</span>
        </a>
      </div>
    </div>
  );
};
