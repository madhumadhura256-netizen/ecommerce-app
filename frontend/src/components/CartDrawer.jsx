import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQty, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const SHIPPING_FREE_THRESHOLD = 500;
  const shippingCharge = cartTotal >= SHIPPING_FREE_THRESHOLD ? 0 : 49;
  const progress = Math.min((cartTotal / SHIPPING_FREE_THRESHOLD) * 100, 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FiShoppingCart size={20} className="text-brand-500" />
                <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                  Cart ({cartCount})
                </h2>
              </div>
              <button onClick={onClose} className="btn-ghost p-2">
                <FiX size={20} />
              </button>
            </div>

            {/* Free shipping bar */}
            {cartCount > 0 && (
              <div className="px-5 py-3 bg-brand-50 dark:bg-brand-900/20">
                {cartTotal >= SHIPPING_FREE_THRESHOLD ? (
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    🎉 You get FREE delivery!
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add <span className="font-bold text-brand-500">₹{SHIPPING_FREE_THRESHOLD - cartTotal}</span> more for FREE delivery
                  </p>
                )}
                <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="text-6xl">🛒</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-500">Add some items to get started</p>
                  </div>
                  <button onClick={onClose} className="btn-primary px-6 py-2.5 text-sm">
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const finalPrice = item.discount > 0
                    ? Math.round(item.price * (1 - item.discount / 100))
                    : item.price;

                  return (
                    <div key={item._id} className="flex gap-3 card p-3">
                      <img
                        src={item.images?.[0] || 'https://placehold.co/80x80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-brand-500">₹{finalPrice}</span>
                          {item.discount > 0 && (
                            <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {/* Qty controls */}
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                              onClick={() => updateQty(item._id, item.quantity - 1)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item._id, item.quantity + 1)}
                              className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span className={shippingCharge === 0 ? 'text-green-500 font-medium' : ''}>
                      {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-1.5 border-t border-gray-100 dark:border-gray-700">
                    <span>Total</span>
                    <span>₹{cartTotal + shippingCharge}</span>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); navigate('/checkout'); }}
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-brand-500 font-medium hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}