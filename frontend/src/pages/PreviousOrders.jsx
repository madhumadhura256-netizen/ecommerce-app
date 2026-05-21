import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios"; // adjust path if needed

export default function PreviousOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/mine");
        setOrders(data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  const statusColors = {
    placed:           { bg: "#dbeafe", color: "#1e40af" },
    confirmed:        { bg: "#e0e7ff", color: "#3730a3" },
    processing:       { bg: "#fef9c3", color: "#854d0e" },
    shipped:          { bg: "#ffedd5", color: "#9a3412" },
    out_for_delivery: { bg: "#fce7f3", color: "#9d174d" },
    delivered:        { bg: "#dcfce7", color: "#166534" },
    cancelled:        { bg: "#fee2e2", color: "#991b1b" },
  };

  if (loading) return <div className="orders-page"><p>Loading orders...</p></div>;
  if (error)   return <div className="orders-page"><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 Previous Orders</h1>
        <p>Track your shopping history</p>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#777" }}>
          <p style={{ fontSize: "3rem" }}>🛍️</p>
          <p>No orders yet. Start shopping!</p>
          <Link to="/category/all" style={{ color: "#FF6B35", fontWeight: 700 }}>
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const s = statusColors[order.orderStatus] || statusColors.placed;
            return (
              <div key={order._id} className="order-card">
                <div>
                  <h3>#{order._id.slice(-8).toUpperCase()}</h3>
                  <p>{formatDate(order.createdAt)}</p>
                  <p style={{ fontSize: "0.8rem", color: "#777" }}>
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <p className="order-total">₹{order.totalPrice}</p>
                  <span
                    className="order-status"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <Link to={`/orders/${order._id}`} className="track-btn">
                  Track →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .orders-page { padding: 40px 24px; }
        .orders-header h1 { font-size: 2.2rem; }
        .orders-header p  { color: #777; margin-bottom: 30px; }
        .orders-list { display: flex; flex-direction: column; gap: 20px; }
        .order-card {
          background: white; border-radius: 20px; padding: 22px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08); flex-wrap: wrap; gap: 16px;
        }
        .order-total { font-weight: 800; font-size: 1.2rem; }
        .order-status {
          display: inline-block;
          padding: 6px 12px; border-radius: 50px;
          font-size: 0.8rem; font-weight: 700; text-transform: capitalize;
          margin-top: 6px;
        }
        .track-btn {
          text-decoration: none; background: #FF6B35; color: white;
          padding: 10px 18px; border-radius: 12px; font-weight: 700;
        }
      `}</style>
    </div>
  );
}