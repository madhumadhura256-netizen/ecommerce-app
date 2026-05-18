import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

export function StarDisplay({ rating = 0, size = 16, showCount, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map((star) => (
          <FiStar
            key={star}
            size={size}
            className={
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-gray-500">({count})</span>
      )}
    </div>
  );
}

export function StarInput({ value = 0, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <FiStar
            size={28}
            className={
              star <= (hover || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  );
}