import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiTag, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/* ─────────────────────────────────────────────
   COUPON DEFINITIONS
   Add / edit coupon codes here.
   Each coupon specifies:
     type: 'flat'       → fixed ₹ discount
           'percent'    → % off (capped by maxDiscount if set)
     minOrder           → minimum cart total required
     description        → shown to user in the tag chip
───────────────────────────────────────────── */
const COUPONS = {
  SAVE10:  { type: 'flat',    value: 10,  minOrder: 100, description: '₹10 off on orders above ₹100' },
  FRESH20: { type: 'percent', value: 20,  minOrder: 300, maxDiscount: 100, description: '20% off (up to ₹100) on orders above ₹300' },
  WELCOME: { type: 'flat',    value: 75,  minOrder: 500, description: '₹75 off on orders above ₹500' },
  BIGBUY:  { type: 'percent', value: 15,  minOrder: 800, maxDiscount: 200, description: '15% off (up to ₹200) on orders above ₹800' },
};

/* Auto-discount rule — no code needed */
const AUTO_DISCOUNT_THRESHOLD = 200;
const AUTO_DISCOUNT_VALUE     = 50;

function calcCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (subtotal < coupon.minOrder) return 0;
  if (coupon.type === 'flat') return coupon.value;
  const pct = Math.round((subtotal * coupon.value) / 100);
  return coupon.maxDiscount ? Math.min(pct, coupon.maxDiscount) : pct;
}

export default function CartDrawer({ open, onClose }) {
  const { cartItems, removeFromCart, updateQty, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  /* ── Coupon state ── */
  const [couponInput,   setCouponInput]   = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, ...COUPON_DEF }
  const [couponStatus,  setCouponStatus]  = useState(null); // 'success' | 'error' | null
  const [couponMsg,     setCouponMsg]     = useState('');

  /* ── Shipping ── */
  const SHIPPING_FREE_THRESHOLD = 500;
  const shippingCharge = cartTotal >= SHIPPING_FREE_THRESHOLD ? 0 : 49;
  const shippingProgress = Math.min((cartTotal / SHIPPING_FREE_THRESHOLD) * 100, 100);

  /* ── Discount calculations ── */
  const autoDiscount   = cartTotal >= AUTO_DISCOUNT_THRESHOLD ? AUTO_DISCOUNT_VALUE : 0;
  const couponDiscount = appliedCoupon
    ? calcCouponDiscount(appliedCoupon, cartTotal)
    : 0;
  const totalDiscount  = autoDiscount + couponDiscount;
  const grandTotal     = Math.max(0, cartTotal + shippingCharge - totalDiscount);

  /* ── Apply coupon handler ── */
  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const coupon = COUPONS[code];
    if (!coupon) {
      setCouponStatus('error');
      setCouponMsg('Invalid coupon code. Please check and try again.');
      setAppliedCoupon(null);
      return;
    }
    if (cartTotal < coupon.minOrder) {
      setCouponStatus('error');
      setCouponMsg(`This coupon requires a minimum order of ₹${coupon.minOrder}.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon({ code, ...coupon });
    setCouponStatus('success');
    setCouponMsg(`${code} applied! ${coupon.description}.`);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponStatus(null);
    setCouponMsg('');
    setCouponInput('');
  };

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-md shadow-2xl z-50 flex flex-col"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <FiShoppingCart size={20} className="text-brand-500" />
                <h2
                  className="font-display font-bold text-lg"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Cart ({cartCount})
                </h2>
              </div>
              <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
                <FiX size={20} />
              </button>
            </div>

            {/* ── Free shipping progress bar ── */}
            {cartCount > 0 && (
              <div className="px-5 py-3 bg-brand-50 dark:bg-brand-900/20">
                {cartTotal >= SHIPPING_FREE_THRESHOLD ? (
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    🎉 You get FREE delivery!
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add{' '}
                    <span className="font-bold text-brand-500">
                      ₹{SHIPPING_FREE_THRESHOLD - cartTotal}
                    </span>{' '}
                    more for FREE delivery
                  </p>
                )}
                <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    className="h-full bg-brand-500 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* ── Auto-discount banner (shows when eligible) ── */}
            {cartCount > 0 && autoDiscount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-5 mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400"
                style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                <FiTag size={14} className="flex-shrink-0" />
                <span>
                  🎁 Auto-discount applied — <strong>₹{AUTO_DISCOUNT_VALUE} off</strong> on orders above ₹{AUTO_DISCOUNT_THRESHOLD}!
                </span>
              </motion.div>
            )}

            {/* ── Cart items ── */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <div className="text-6xl">🛒</div>
                  <div>
                    <p
                      className="font-semibold mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Your cart is empty
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Add some items to get started
                    </p>
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
                        <p
                          className="text-sm font-semibold line-clamp-2 leading-tight"
                          style={{ color: 'var(--text-primary)' }}
                        >
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

            {/* ── Footer ── */}
            {cartItems.length > 0 && (
              <div
                className="p-5 space-y-4"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                {/* ── Coupon input ── */}
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <FiTag size={11} className="inline mr-1" />
                    Coupon Code
                  </p>

                  {/* Applied coupon chip */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      <div className="flex items-center gap-2">
                        <FiCheck size={14} className="text-green-500" />
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          — ₹{couponDiscount} off
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponStatus(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter coupon code"
                        className="input-field flex-1 py-2 text-sm uppercase tracking-widest"
                        maxLength={20}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim()}
                        className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Status message */}
                  <AnimatePresence>
                    {couponStatus && !appliedCoupon && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                          couponStatus === 'error'
                            ? 'text-red-500'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        <FiAlertCircle size={11} />
                        {couponMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Available coupons hint */}
                  {!appliedCoupon && (
                    <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      Try: SAVE10 · FRESH20 · WELCOME · BIGBUY
                    </p>
                  )}
                </div>

                {/* ── Price breakdown ── */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>

                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    <span className={shippingCharge === 0 ? 'text-green-500 font-medium' : ''}>
                      {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}
                    </span>
                  </div>

                  {/* Auto discount row */}
                  {autoDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <FiTag size={12} />
                        Auto discount (order {'>'} ₹{AUTO_DISCOUNT_THRESHOLD})
                      </span>
                      <span className="font-medium">−₹{autoDiscount}</span>
                    </div>
                  )}

                  {/* Coupon discount row */}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <FiTag size={12} />
                        Coupon ({appliedCoupon.code})
                      </span>
                      <span className="font-medium">−₹{couponDiscount}</span>
                    </div>
                  )}

                  {/* Total savings pill */}
                  {totalDiscount > 0 && (
                    <div
                      className="flex justify-between text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'rgba(34,197,94,0.08)', color: 'rgb(22,163,74)' }}
                    >
                      <span>🎉 Total savings</span>
                      <span>−₹{totalDiscount}</span>
                    </div>
                  )}

                  {/* Grand total */}
                  <div
                    className="flex justify-between font-bold text-base pt-2"
                    style={{
                      color: 'var(--text-primary)',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span>Total</span>
                    <div className="text-right">
                      <span>₹{grandTotal}</span>
                      {totalDiscount > 0 && (
                        <p className="text-xs font-normal text-gray-400 line-through">
                          ₹{cartTotal + shippingCharge}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => { onClose(); navigate('/checkout'); }}
                  className="btn-primary w-full text-center"
                >
                  Proceed to Checkout · ₹{grandTotal}
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