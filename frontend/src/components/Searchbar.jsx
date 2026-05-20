import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../services/api';
import { useDebounce } from '../hooks/Usedebounce';

export default function SearchBar({ onSearch }) {
  const [query,   setQuery]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounced = useDebounce(query, 350);

  const { data } = useQuery({
    queryKey: ['search-suggest', debounced],
    queryFn:  () => productAPI.getAll({ search: debounced, limit: 5 }),
    enabled:  debounced.length > 1,
    select:   (res) => res.data.products,
  });

  const suggestions = data || [];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    navigate(`/category/all?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
    setFocused(false);
    onSearch?.();
  };

  const handleSelect = (product) => {
    navigate(`/products/${product._id}`);
    setQuery('');
    setFocused(false);
    onSearch?.();
  };

  return (
    /*
      KEY FIX: position-relative + z-[9999] on the wrapper.
      On mobile the search bar is rendered INSIDE the sticky header
      (z-50 = 50). The dropdown needs to punch above the carousel/hero
      section below, so we escalate to z-[9999] here.
      The header itself is already `sticky top-0 z-50`, which creates a
      new stacking context — so the dropdown must be a sibling of the
      form, not a child that gets clipped by overflow:hidden elsewhere.
    */
    <div className="relative w-full" style={{ zIndex: 9999 }}>
      <form onSubmit={handleSubmit} className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search products, brands..."
          className="input-field pl-10 pr-10 py-2.5 text-sm w-full"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <FiX size={16} />
          </button>
        )}
      </form>

      {/* Suggestions dropdown — rendered outside form flow to avoid stacking issues */}
      {focused && suggestions.length > 0 && (
        <div
          className="absolute top-full mt-1 left-0 right-0 card shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          /*
            Do NOT put overflow-hidden on this wrapper — it would clip the
            shadow. The z-index is inherited from the parent wrapper above.
          */
          style={{ zIndex: 9999 }}
        >
          {suggestions.map((product) => (
            <button
              key={product._id}
              onMouseDown={() => handleSelect(product)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <img
                src={product.images?.[0] || 'https://placehold.co/40x40'}
                alt={product.name}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {product.category}
                </p>
              </div>
              <span className="ml-auto text-sm font-semibold text-brand-500 flex-shrink-0">
                ₹{product.price}
              </span>
            </button>
          ))}

          <button
            onMouseDown={handleSubmit}
            className="w-full px-4 py-2.5 text-sm text-brand-500 font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 text-center border-t border-gray-100 dark:border-gray-700 transition-colors"
          >
            See all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}