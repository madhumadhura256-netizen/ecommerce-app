import { Link } from "react-router-dom";

export default function PreviousOrders() {
  const orders = [
    {
      id: "ORD1024",
      date: "15 May 2026",
      total: 2499,
      status: "Delivered",
    },
    {
      id: "ORD1025",
      date: "10 May 2026",
      total: 799,
      status: "Shipped",
    },
  ];

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 Previous Orders</h1>
        <p>Track your shopping history</p>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div>
              <h3>{order.id}</h3>
              <p>{order.date}</p>
            </div>

            <div>
              <p className="order-total">
                ₹{order.total}
              </p>

              <span className="order-status">
                {order.status}
              </span>
            </div>

            <Link
              to={`/track/${order.id}`}
              className="track-btn"
            >
              Track →
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .orders-page {
          padding: 40px 24px;
        }

        .orders-header h1 {
          font-size: 2.2rem;
        }

        .orders-header p {
          color: #777;
          margin-bottom: 30px;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 20px;
          padding: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          flex-wrap: wrap;
          gap: 16px;
        }

        .order-total {
          font-weight: 800;
          font-size: 1.2rem;
        }

        .order-status {
          background: #dcfce7;
          color: #166534;
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .track-btn {
          text-decoration: none;
          background: #FF6B35;
          color: white;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}