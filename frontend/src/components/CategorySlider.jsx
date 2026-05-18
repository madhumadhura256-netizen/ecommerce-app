import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { slug: 'fruits',      label: 'Fruits',       icon: '🍎', bg: 'from-red-400 to-pink-500' },
  { slug: 'vegetables',  label: 'Vegetables',   icon: '🥦', bg: 'from-green-400 to-emerald-500' },
  { slug: 'groceries',   label: 'Groceries',    icon: '🛒', bg: 'from-yellow-400 to-amber-500' },
  { slug: 'snacks',      label: 'Snacks',       icon: '🍿', bg: 'from-orange-400 to-red-500' },
  { slug: 'chocolates',  label: 'Chocolates',   icon: '🍫', bg: 'from-amber-600 to-yellow-700' },
  { slug: 'beverages',   label: 'Beverages',    icon: '🥤', bg: 'from-blue-400 to-cyan-500' },
  { slug: 'dairy',       label: 'Dairy',        icon: '🥛', bg: 'from-sky-300 to-blue-400' },
  { slug: 'electronics', label: 'Electronics',  icon: '📱', bg: 'from-purple-400 to-violet-500' },
  { slug: 'clothes',     label: 'Clothes',      icon: '👗', bg: 'from-pink-400 to-rose-500' },
  { slug: 'shoes',       label: 'Shoes',        icon: '👟', bg: 'from-indigo-400 to-blue-500' },
  { slug: 'beauty',      label: 'Beauty',       icon: '💄', bg: 'from-fuchsia-400 to-pink-500' },
  { slug: 'other',       label: 'More',         icon: '🎁', bg: 'from-gray-400 to-slate-500' },
];

export default function CategorySlider() {
  const scrollRef = useRef(null);
  const navigate  = useNavigate();

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiChevronLeft size={18} />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.slug}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/category/${cat.slug}`)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${cat.bg} flex items-center justify-center text-2xl sm:text-3xl shadow-md hover:scale-105 transition-transform duration-200`}>
              {cat.icon}
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}