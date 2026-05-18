import { FiCheck, FiPackage, FiTruck, FiHome, FiShoppingBag, FiXCircle } from 'react-icons/fi';

const STEPS = [
  { key: 'placed',           label: 'Order Placed',       icon: FiShoppingBag },
  { key: 'confirmed',        label: 'Confirmed',          icon: FiCheck },
  { key: 'packed',           label: 'Packed',             icon: FiPackage },
  { key: 'shipped',          label: 'Shipped',            icon: FiTruck },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: FiTruck },
  { key: 'delivered',        label: 'Delivered',          icon: FiHome },
];

const STATUS_ORDER = STEPS.map((s) => s.key);

export default function OrderTracker({ status, updates = [] }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
        <FiXCircle className="text-red-500" size={24} />
        <div>
          <p className="font-semibold text-red-600">Order Cancelled</p>
          {updates.slice(-1)[0]?.message && (
            <p className="text-sm text-red-400">{updates.slice(-1)[0].message}</p>
          )}
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const isDone    = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isPending = idx > currentIdx;

        const Icon = step.icon;
        const update = updates.find((u) => u.status === step.key);

        return (
          <div key={step.key} className="tracker-step">
            <div className="flex flex-col items-center">
              <div
                className={`tracker-dot flex items-center justify-center transition-all duration-300
                  ${isDone    ? 'bg-brand-500 text-white' : ''}
                  ${isCurrent ? 'bg-brand-500 text-white ring-4 ring-brand-200 dark:ring-brand-900' : ''}
                  ${isPending ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : ''}
                `}
              >
                {isDone
                  ? <FiCheck size={10} />
                  : <Icon size={10} />
                }
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`tracker-line transition-colors duration-500 ${idx < currentIdx ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>

            <div className="pb-6">
              <p className={`text-sm font-semibold ${isCurrent ? 'text-brand-500' : isPending ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {step.label}
              </p>
              {update && (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{update.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(update.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}