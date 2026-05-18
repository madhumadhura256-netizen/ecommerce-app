import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../services/api';
import useDebounce from '../hooks/Usedebounce'

export default function SearchBar({ onSearch }) {
  const [query,  setQuery]  = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef  = useRef(null);
  const navigate  = useNavigate();
  const debounced = useDebounce(query, 350);

  const { data } = useQuery({
    queryKey: ['search-suggest', debounced],
    queryFn: () => productAPI.getAll({ search: debounced, limit: 5 }),
    enabled: debounced.length > 1,
    select: (res) => res.data.products,
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
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search products, brands..."
          className="input-field pl-10 pr-10 py-2.5 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={16} />
          </button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {focused && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 card shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          {suggestions.map((product) => (
            <button
              key={product._id}
              onMouseDown={() => handleSelect(product)}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <img
                src={product.images[0] || 'https://placehold.co/40x40'}
                alt={product.name}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
              </div>
              <span className="ml-auto text-sm font-semibold text-brand-500 flex-shrink-0">₹{product.price}</span>
            </button>
          ))}
          <button
            onMouseDown={handleSubmit}
            className="w-full px-4 py-2.5 text-sm text-brand-500 font-medium hover:bg-brand-50 dark:hover:bg-brand-900/20 text-center border-t border-gray-100 dark:border-gray-700"
          >
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}