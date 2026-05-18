import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, isInCart } = useCart();
  const { isAuth }              = useAuth();
  const [liked, setLiked]       = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const finalPrice = product.discount > 0
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuth) { toast.error('Please login to use wishlist'); return; }
    setWishLoading(true);
    try {
      if (liked) {
        await wishlistAPI.remove(product._id);
        setLiked(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.add(product._id);
        setLiked(true);
        toast.success('Added to wishlist ❤️');
      }
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="product-card card overflow-hidden group"
    >
      <Link to={`/products/${product._id}`} className="block">
        {/* Image */}
        <div className="product-img-wrap relative aspect-square bg-gray-50 dark:bg-gray-800">
          <img
            src={product.images?.[0] || `https://placehold.co/300x300/f0f0f0/999?text=${product.name.slice(0,8)}`}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount > 0 && (
              <span className="badge bg-brand-500 text-white">{product.discount}% OFF</span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-500 text-white">Out of Stock</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-yellow-400 text-yellow-900">⭐ Featured</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            disabled={wishLoading}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md
              ${liked
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 opacity-0 group-hover:opacity-100'
              }`}
            aria-label="Wishlist"
          >
            <FiHeart size={14} fill={liked ? 'white' : 'none'} />
          </button>

          {/* Quick add */}
          <div className="absolute bottom-0 inset-x-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (product.stock > 0) addToCart(product);
              }}
              disabled={product.stock === 0 || isInCart(product._id)}
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200
                ${product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isInCart(product._id)
                    ? 'bg-green-500 text-white'
                    : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand'
                }`}
            >
              {product.stock === 0
                ? 'Out of Stock'
                : isInCart(product._id)
                  ? '✓ In Cart'
                  : 'Add to Cart'
              }
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.brand && (
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{product.brand}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map((star) => (
                  <FiStar
                    key={star}
                    size={11}
                    className={star <= Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.numReviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-white">₹{finalPrice}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}