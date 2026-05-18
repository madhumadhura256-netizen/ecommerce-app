import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";

const STATUS_STEPS = [
  { key:"placed",           icon:"📋", label:"Order Placed",      desc:"Your order has been received" },
  { key:"confirmed",        icon:"✅", label:"Confirmed",          desc:"Seller confirmed your order" },
  { key:"packed",           icon:"📦", label:"Packed",             desc:"Order has been packed" },
  { key:"shipped",          icon:"🚛", label:"Shipped",            desc:"On its way to you" },
  { key:"out_for_delivery", icon:"🛵", label:"Out for Delivery",   desc:"Arriving today!" },
  { key:"delivered",        icon:"🎉", label:"Delivered",          desc:"Enjoy your purchase!" },
];

const ORDER_MOCK = {
  _id:"ORD123456",
  orderStatus:"shipped",
  createdAt: new Date(Date.now()-2*86400000).toISOString(),
  items:[
    {name:"Wireless Earbuds",image:"",price:2549,quantity:1},
    {name:"Phone Case",image:"",price:299,quantity:2},
  ],
  shippingAddress:{street:"42 MG Road",city:"Bengaluru",state:"Karnataka",pincode:"560001"},
  paymentMethod:"upi",
  isPaid:true,
  totalPrice:3147,
  trackingUpdates:[
    {status:"placed",       message:"Order placed successfully",         timestamp:new Date(Date.now()-2*86400000).toISOString()},
    {status:"confirmed",    message:"Seller confirmed order",            timestamp:new Date(Date.now()-1.8*86400000).toISOString()},
    {status:"packed",       message:"Order packed and ready to ship",    timestamp:new Date(Date.now()-1.2*86400000).toISOString()},
    {status:"shipped",      message:"Shipped via BlueDart #BDA93821",   timestamp:new Date(Date.now()-0.5*86400000).toISOString()},
  ]
};

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await orderAPI.getById(id);
        setOrder(res.data?.order || res.data);
      } catch {
        setOrder(ORDER_MOCK);
      } finally { setLoading(false); }
    };
    fetch();
    // Poll every 30s for live updates
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="tracking-page">
      <div className="tracking-loading">
        <div className="track-spinner"/>
        <p>Loading order details…</p>
      </div>
      <style>{`.tracking-page{display:flex;align-items:center;justify-content:center;min-height:60vh;}.tracking-loading{text-align:center;color:var(--text-muted,#888);}.track-spinner{width:48px;height:48px;border:4px solid var(--border,#e5e7eb);border-top-color:#FF6B35;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!order) return <div style={{textAlign:"center",padding:"60px"}}>Order not found. <Link to="/previous-orders">View all orders</Link></div>;

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  const estimatedDelivery = () => {
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-IN", { weekday:"short", month:"short", day:"numeric" });
  };

  return (
    <div className="ot-page">
      {/* Hero status */}
      <div className={`ot-hero ${isCancelled ? "cancelled" : order.orderStatus==="delivered"?"delivered":""}`}>
        <div className="ot-hero-inner">
          <span className="ot-hero-icon">
            {isCancelled?"❌": STATUS_STEPS[currentIdx]?.icon || "📋"}
          </span>
          <div>
            <h1 className="ot-hero-title">
              {isCancelled?"Order Cancelled": order.orderStatus==="delivered"?"Order Delivered!": "Order in Progress"}
            </h1>
            <p className="ot-hero-sub">
              Order #{order._id?.slice(-8)?.toUpperCase()} •{" "}
              {!isCancelled && order.orderStatus!=="delivered" && `Expected by ${estimatedDelivery()}`}
              {order.orderStatus==="delivered" && "Delivered successfully"}
              {isCancelled && "Your order has been cancelled"}
            </p>
          </div>
        </div>
      </div>

      <div className="ot-container">
        {/* Tracker */}
        {!isCancelled && (
          <div className="ot-card">
            <h2 className="ot-card-title">📍 Live Tracking</h2>
            <div className="tracker-steps">
              {STATUS_STEPS.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s.key} className={`tracker-step ${done?"done":""} ${active?"active":""}`}>
                    <div className="tracker-step-left">
                      <div className="tracker-icon">{done ? (active ? s.icon : "✓") : s.icon}</div>
                      {i < STATUS_STEPS.length-1 && <div className={`tracker-line ${done&&!active?"filled":""}`}/>}
                    </div>
                    <div className="tracker-info">
                      <p className="tracker-label">{s.label}</p>
                      <p className="tracker-desc">
                        {done
                          ? order.trackingUpdates?.find(u=>u.status===s.key)?.message || s.desc
                          : s.desc
                        }
                      </p>
                      {done && order.trackingUpdates?.find(u=>u.status===s.key) && (
                        <p className="tracker-time">
                          {new Date(order.trackingUpdates.find(u=>u.status===s.key).timestamp).toLocaleString("en-IN",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="ot-grid">
          {/* Items */}
          <div className="ot-card">
            <h2 className="ot-card-title">🛍️ Order Items</h2>
            <div className="ot-items">
              {order.items.map((item,i)=>(
                <div key={i} className="ot-item">
                  <div className="ot-item-img">
                    {item.image?<img src={item.image} alt={item.name}/>:<span>📦</span>}
                  </div>
                  <div className="ot-item-info">
                    <p className="ot-item-name">{item.name}</p>
                    <p className="ot-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="ot-item-price">₹{(item.price*item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="ot-order-total">
              <span>Order Total</span>
              <span>₹{order.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="ot-card">
            <h2 className="ot-card-title">🏠 Delivery Info</h2>
            <div className="info-rows">
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-val">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Payment</span>
                <span className="info-val">{order.paymentMethod?.toUpperCase()} — {order.isPaid?"Paid ✓":"Pending"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Placed On</span>
                <span className="info-val">{new Date(order.createdAt).toLocaleDateString("en-IN",{year:"numeric",month:"long",day:"numeric"})}</span>
              </div>
            </div>

            <div className="ot-actions">
              {order.orderStatus==="delivered" && (
                <button className="btn-review">⭐ Write a Review</button>
              )}
              {["placed","confirmed"].includes(order.orderStatus) && (
                <button className="btn-cancel">Cancel Order</button>
              )}
              <Link to="/previous-orders" className="btn-back-orders">← All Orders</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ot-page{min-height:100vh;background:var(--bg,#f8fafc);}
        .ot-hero{padding:40px 24px;background:linear-gradient(135deg,#1e3a5f,#2563eb);}
        .ot-hero.delivered{background:linear-gradient(135deg,#14532d,#16a34a);}
        .ot-hero.cancelled{background:linear-gradient(135deg,#7f1d1d,#ef4444);}
        .ot-hero-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;gap:20px;}
        .ot-hero-icon{font-size:3.5rem;flex-shrink:0;}
        .ot-hero-title{font-family:'Playfair Display',Georgia,serif;font-size:1.8rem;font-weight:800;color:#fff;margin:0 0 6px;}
        .ot-hero-sub{color:rgba(255,255,255,0.75);font-size:0.95rem;margin:0;}
        .ot-container{max-width:900px;margin:0 auto;padding:28px 24px;}
        .ot-card{background:var(--bg-card,#fff);border-radius:20px;padding:24px;border:1px solid var(--border,#e5e7eb);margin-bottom:20px;}
        .ot-card-title{font-family:'Playfair Display',Georgia,serif;font-size:1.1rem;font-weight:800;color:var(--text,#111);margin:0 0 20px;}
        .tracker-steps{display:flex;flex-direction:column;gap:0;}
        .tracker-step{display:flex;gap:16px;}
        .tracker-step-left{display:flex;flex-direction:column;align-items:center;width:48px;flex-shrink:0;}
        .tracker-icon{width:48px;height:48px;border-radius:50%;border:2px solid var(--border,#d1d5db);display:flex;align-items:center;justify-content:center;font-size:1.3rem;background:var(--bg-card,#fff);transition:all 0.3s;flex-shrink:0;}
        .tracker-step.done .tracker-icon{border-color:#22c55e;background:#f0fdf4;}
        .tracker-step.active .tracker-icon{border-color:#FF6B35;background:rgba(255,107,53,0.08);animation:pulse 1.8s infinite;}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,53,0.3)}50%{box-shadow:0 0 0 8px rgba(255,107,53,0)}}
        .tracker-line{flex:1;width:2px;background:var(--border,#e5e7eb);min-height:32px;margin:4px 0;transition:background 0.3s;}
        .tracker-line.filled{background:#22c55e;}
        .tracker-info{padding:10px 0 24px;}
        .tracker-label{font-weight:800;font-size:0.92rem;color:var(--text,#111);margin:0 0 3px;}
        .tracker-step.done .tracker-label{color:#16a34a;}
        .tracker-step.active .tracker-label{color:#FF6B35;}
        .tracker-desc{font-size:0.82rem;color:var(--text-muted,#888);margin:0 0 3px;}
        .tracker-time{font-size:0.75rem;color:var(--text-muted,#aaa);font-weight:600;}
        .ot-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        .ot-items{display:flex;flex-direction:column;gap:12px;margin-bottom:16px;}
        .ot-item{display:flex;align-items:center;gap:12px;}
        .ot-item-img{width:52px;height:52px;border-radius:12px;overflow:hidden;background:var(--bg-hover,#f9fafb);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;}
        .ot-item-img img{width:100%;height:100%;object-fit:cover;}
        .ot-item-name{font-size:0.88rem;font-weight:700;color:var(--text,#111);margin:0 0 2px;}
        .ot-item-qty{font-size:0.78rem;color:var(--text-muted,#888);margin:0;}
        .ot-item-price{margin-left:auto;font-weight:800;font-size:0.9rem;color:var(--text,#111);}
        .ot-order-total{display:flex;justify-content:space-between;font-weight:900;font-size:1rem;border-top:1px solid var(--border,#e5e7eb);padding-top:12px;color:var(--text,#111);}
        .info-rows{display:flex;flex-direction:column;gap:14px;margin-bottom:20px;}
        .info-row{display:flex;gap:12px;}
        .info-label{font-size:0.8rem;font-weight:700;color:var(--text-muted,#888);min-width:80px;text-transform:uppercase;letter-spacing:.04em;}
        .info-val{font-size:0.88rem;color:var(--text,#444);flex:1;}
        .ot-actions{display:flex;flex-direction:column;gap:10px;}
        .btn-review{padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-weight:700;font-size:0.9rem;cursor:pointer;}
        .btn-cancel{padding:11px;border-radius:12px;border:1.5px solid #ef4444;background:transparent;color:#ef4444;font-weight:700;font-size:0.9rem;cursor:pointer;transition:background 0.2s;}
        .btn-cancel:hover{background:#fef2f2;}
        .btn-back-orders{display:block;text-align:center;padding:11px;border-radius:12px;border:1.5px solid var(--border,#d1d5db);color:var(--text,#666);text-decoration:none;font-weight:700;font-size:0.88rem;transition:background 0.2s;}
        .btn-back-orders:hover{background:var(--bg-hover,#f3f4f6);}
        @media(max-width:640px){.ot-grid{grid-template-columns:1fr;}.ot-hero-icon{font-size:2.5rem;}}
      `}</style>
    </div>
  );
}