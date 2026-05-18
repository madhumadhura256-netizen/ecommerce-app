import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-400"
    >
      <motion.div
        animate={{ x: isDark ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
      >
        {isDark
          ? <FiMoon size={11} className="text-gray-700" />
          : <FiSun  size={11} className="text-yellow-500" />
        }
      </motion.div>
    </button>
  );
}