import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { useGeoLocation } from "../hooks/useGeoLocation";

const STEPS = ["Address", "Payment", "Review"];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { location, loading: gpsLoading, error: gpsError, getLocation } = useGeoLocation();

  const [step, setStep]         = useState(0);
  const [placing, setPlacing]   = useState(false);
  const [error, setError]       = useState("");

  const [address, setAddress] = useState({
    street: "", city: "", state: "", pincode: "", label: "Home"
  });
  const [addrErrors, setAddrErrors] = useState({});
  const [payMethod, setPayMethod]   = useState("cod");

  const shipping = cartTotal > 499 ? 0 : 49;
  const tax      = Math.round(cartTotal * 0.05);
  const total    = cartTotal + shipping + tax;

  useEffect(() => {
    if (!user) navigate("/login", { state: { from: "/checkout" } });
    if (cart.length === 0) navigate("/cart");
  }, [user, cart]);

  const validateAddress = () => {
    const e = {};
    if (!address.street.trim()) e.street = "Street required";
    if (!address.city.trim())   e.city   = "City required";
    if (!address.state.trim())  e.state  = "State required";
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Valid 6-digit pincode required";
    setAddrErrors(e);
    return !Object.keys(e).length;
  };

  const handleAddrChange = e => {
    const { name, value } = e.target;
    setAddress(a => ({ ...a, [name]: value }));
    if (addrErrors[name]) setAddrErrors(er => ({ ...er, [name]: "" }));
  };

  const useGPS = () => {
    getLocation();
  };

  const placeOrder = async () => {
    setPlacing(true); setError("");
    try {
      const payload = {
        items: cart.map(i => ({
          product: i._id, name: i.name, image: i.images?.[0] || "",
          price: i.discount ? Math.round(i.price - i.price*i.discount/100) : i.price,
          quantity: i.quantity
        })),
        shippingAddress: {
          ...address,
          location: location ? { type:"Point", coordinates:[location.lng,location.lat] } : undefined
        },
        paymentMethod: payMethod,
        itemsPrice: cartTotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
      };
      const res = await orderAPI.create(payload);
      const orderId = res.data?.order?._id || res.data?._id || "NEW";
      clearCart();
      navigate(`/order-tracking/${orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setPlacing(false);
    }
  };

  const dp = p => p.discount ? Math.round(p.price - p.price*p.discount/100) : p.price;

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Progress */}
        <div className="checkout-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`ch-step ${i<=step?"active":""} ${i<step?"done":""}`}>
              <div className="ch-step-circle">{i<step?"✓":i+1}</div>
              <span className="ch-step-label">{s}</span>
              {i<STEPS.length-1 && <div className={`ch-step-line ${i<step?"done":""}`}/>}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* Step 0: Address */}
            {step===0 && (
              <div className="ch-card">
                <h2 className="ch-section-title">🏠 Delivery Address</h2>

                <div className="label-selector">
                  {["Home","Work","Other"].map(l=>(
                    <button key={l} className={`label-btn ${address.label===l?"active":""}`}
                      onClick={()=>setAddress(a=>({...a,label:l}))}>
                      {l==="Home"?"🏠":l==="Work"?"🏢":"📍"} {l}
                    </button>
                  ))}
                </div>

                <div className="addr-form">
                  {[
                    {name:"street",label:"Street Address",placeholder:"123 Main St, Apt 4B",full:true},
                    {name:"city",label:"City",placeholder:"Bengaluru"},
                    {name:"state",label:"State",placeholder:"Karnataka"},
                    {name:"pincode",label:"Pincode",placeholder:"560001"},
                  ].map(f=>(
                    <div key={f.name} className={`field-group ${f.full?"full":""}`}>
                      <label className="field-label">{f.label}</label>
                      <input
                        type="text" name={f.name} value={address[f.name]}
                        onChange={handleAddrChange} placeholder={f.placeholder}
                        className={`addr-input ${addrErrors[f.name]?"error":""}`}
                      />
                      {addrErrors[f.name]&&<p className="field-error">{addrErrors[f.name]}</p>}
                    </div>
                  ))}
                </div>

                <div className="gps-section">
                  <button className="btn-gps" onClick={useGPS} disabled={gpsLoading}>
                    {gpsLoading?"📡 Getting location…":"📍 Use My GPS Location"}
                  </button>
                  {location && <p className="gps-success">✓ Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>}
                  {gpsError && <p className="gps-error">⚠️ {gpsError}</p>}
                </div>

                <button className="btn-next" onClick={()=>{ if(validateAddress()) setStep(1); }}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step===1 && (
              <div className="ch-card">
                <h2 className="ch-section-title">💳 Payment Method</h2>
                <div className="pay-options">
                  {[
                    {id:"cod",    icon:"💰", label:"Cash on Delivery",   sub:"Pay when you receive"},
                    {id:"upi",    icon:"📱", label:"UPI",                 sub:"PhonePe, GPay, Paytm"},
                    {id:"card",   icon:"💳", label:"Credit/Debit Card",   sub:"All major cards accepted"},
                    {id:"netbank",icon:"🏦", label:"Net Banking",          sub:"All major banks"},
                  ].map(pm=>(
                    <label key={pm.id} className={`pay-option ${payMethod===pm.id?"active":""}`}>
                      <input type="radio" name="pay" value={pm.id} checked={payMethod===pm.id} onChange={()=>setPayMethod(pm.id)} />
                      <span className="pay-icon-big">{pm.icon}</span>
                      <div>
                        <p className="pay-label">{pm.label}</p>
                        <p className="pay-sub">{pm.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {payMethod==="card" && (
                  <div className="card-form">
                    <div className="field-group full"><label className="field-label">Card Number</label><input className="addr-input" placeholder="1234 5678 9012 3456" maxLength="19"/></div>
                    <div className="field-group"><label className="field-label">Expiry</label><input className="addr-input" placeholder="MM/YY"/></div>
                    <div className="field-group"><label className="field-label">CVV</label><input className="addr-input" placeholder="•••" type="password"/></div>
                    <div className="field-group full"><label className="field-label">Name on Card</label><input className="addr-input" placeholder="Jane Doe"/></div>
                  </div>
                )}
                {payMethod==="upi" && (
                  <div className="addr-form">
                    <div className="field-group full"><label className="field-label">UPI ID</label><input className="addr-input" placeholder="yourname@upi"/></div>
                  </div>
                )}
                <div className="btn-row-nav">
                  <button className="btn-back" onClick={()=>setStep(0)}>← Back</button>
                  <button className="btn-next" onClick={()=>setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step===2 && (
              <div className="ch-card">
                <h2 className="ch-section-title">📋 Review Order</h2>
                {error && <div className="alert-error">⚠️ {error}</div>}

                <div className="review-section">
                  <div className="review-block">
                    <p className="review-block-title">📍 Delivery to ({address.label})</p>
                    <p className="review-block-text">{address.street}, {address.city}, {address.state} — {address.pincode}</p>
                    <button className="edit-link" onClick={()=>setStep(0)}>Edit</button>
                  </div>
                  <div className="review-block">
                    <p className="review-block-title">💳 Payment</p>
                    <p className="review-block-text">{{cod:"Cash on Delivery",upi:"UPI",card:"Card",netbank:"Net Banking"}[payMethod]}</p>
                    <button className="edit-link" onClick={()=>setStep(1)}>Edit</button>
                  </div>
                </div>

                <div className="review-items">
                  {cart.map(item=>(
                    <div key={item._id} className="review-item">
                      <div className="review-item-img">
                        {item.images?.[0]?<img src={item.images[0]} alt={item.name}/>:<span>📦</span>}
                      </div>
                      <div className="review-item-info">
                        <p className="review-item-name">{item.name}</p>
                        <p className="review-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="review-item-price">₹{(dp(item)*item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <div className="btn-row-nav">
                  <button className="btn-back" onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn-place" onClick={placeOrder} disabled={placing}>
                    {placing?<><span className="spinner"/>Placing Order…</>:"🛒 Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-items">
              {cart.map(item=>(
                <div key={item._id} className="summary-item">
                  <span className="summary-item-name">{item.name} ×{item.quantity}</span>
                  <span>₹{(dp(item)*item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider"/>
            {[["Subtotal",`₹${cartTotal.toLocaleString()}`],["Shipping",shipping===0?"FREE":"₹"+shipping],["GST (5%)",`₹${tax}`]].map(([k,v])=>(
              <div key={k} className="summary-row"><span>{k}</span><span className={v==="FREE"?"free-ship":""}>{v}</span></div>
            ))}
            <div className="summary-total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page{min-height:100vh;background:var(--bg,#f8fafc);padding:24px;}
        .checkout-container{max-width:1000px;margin:0 auto;}
        .checkout-progress{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:32px;padding:20px;background:var(--bg-card,#fff);border-radius:18px;border:1px solid var(--border,#e5e7eb);}
        .ch-step{display:flex;align-items:center;gap:10px;position:relative;}
        .ch-step-circle{width:36px;height:36px;border-radius:50%;border:2px solid var(--border,#d1d5db);display:flex;align-items:center;justify-content:center;font-size:0.88rem;font-weight:800;color:var(--text-muted,#aaa);flex-shrink:0;transition:all 0.3s;}
        .ch-step.active .ch-step-circle{border-color:#FF6B35;color:#FF6B35;}
        .ch-step.done .ch-step-circle{background:#FF6B35;border-color:#FF6B35;color:#fff;}
        .ch-step-label{font-size:0.85rem;font-weight:700;color:var(--text-muted,#aaa);}
        .ch-step.active .ch-step-label,.ch-step.done .ch-step-label{color:var(--text,#111);}
        .ch-step-line{width:60px;height:2px;background:var(--border,#e5e7eb);margin:0 10px;transition:background 0.3s;}
        .ch-step-line.done{background:#FF6B35;}
        .checkout-layout{display:grid;grid-template-columns:1fr 300px;gap:24px;align-items:flex-start;}
        .ch-card{background:var(--bg-card,#fff);border-radius:20px;padding:28px;border:1px solid var(--border,#e5e7eb);}
        .ch-section-title{font-family:'Playfair Display',Georgia,serif;font-size:1.3rem;font-weight:800;color:var(--text,#111);margin:0 0 22px;}
        .label-selector{display:flex;gap:10px;margin-bottom:20px;}
        .label-btn{padding:8px 18px;border-radius:20px;border:1.5px solid var(--border,#d1d5db);background:transparent;color:var(--text,#666);font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;}
        .label-btn.active{border-color:#FF6B35;color:#FF6B35;background:rgba(255,107,53,0.08);}
        .addr-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
        .field-group{display:flex;flex-direction:column;gap:5px;}
        .field-group.full{grid-column:1/-1;}
        .field-label{font-size:0.82rem;font-weight:700;color:var(--text,#111);}
        .addr-input{padding:11px 14px;border:1.5px solid var(--border,#d1d5db);border-radius:12px;background:var(--bg,#f9fafb);color:var(--text,#111);font-size:0.92rem;outline:none;transition:border-color 0.2s;}
        .addr-input:focus{border-color:#FF6B35;box-shadow:0 0 0 3px rgba(255,107,53,0.1);}
        .addr-input.error{border-color:#ef4444;}
        .field-error{font-size:0.75rem;color:#ef4444;margin:0;}
        .card-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
        .gps-section{margin-bottom:22px;}
        .btn-gps{display:flex;align-items:center;gap:8px;padding:11px 20px;border-radius:12px;border:1.5px solid #FF6B35;background:transparent;color:#FF6B35;font-weight:700;font-size:0.9rem;cursor:pointer;transition:background 0.2s;}
        .btn-gps:hover:not(:disabled){background:rgba(255,107,53,0.08);}
        .btn-gps:disabled{opacity:0.6;cursor:not-allowed;}
        .gps-success{font-size:0.82rem;color:#16a34a;font-weight:600;margin-top:8px;}
        .gps-error{font-size:0.82rem;color:#ef4444;margin-top:8px;}
        .pay-options{display:flex;flex-direction:column;gap:12px;margin-bottom:20px;}
        .pay-option{display:flex;align-items:center;gap:14px;padding:16px;border-radius:14px;border:1.5px solid var(--border,#d1d5db);cursor:pointer;transition:all 0.2s;background:var(--bg,#f9fafb);}
        .pay-option input{display:none;}
        .pay-option.active{border-color:#FF6B35;background:rgba(255,107,53,0.04);}
        .pay-icon-big{font-size:1.8rem;}
        .pay-label{font-weight:700;font-size:0.92rem;color:var(--text,#111);margin:0 0 2px;}
        .pay-sub{font-size:0.78rem;color:var(--text-muted,#888);margin:0;}
        .btn-row-nav{display:flex;gap:12px;margin-top:20px;}
        .btn-back{padding:13px 22px;border-radius:12px;border:1.5px solid var(--border,#d1d5db);background:transparent;color:var(--text,#111);font-weight:700;font-size:0.92rem;cursor:pointer;transition:background 0.2s;}
        .btn-back:hover{background:var(--bg-hover,#f3f4f6);}
        .btn-next{flex:1;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#FF6B35,#f43f5e);color:#fff;font-weight:800;font-size:0.95rem;cursor:pointer;transition:opacity 0.2s;}
        .btn-next:hover{opacity:0.9;}
        .btn-place{flex:1;padding:13px;border-radius:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-weight:800;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity 0.2s;}
        .btn-place:disabled{opacity:0.7;cursor:not-allowed;}
        .spinner{width:18px;height:18px;border:3px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .alert-error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:12px 16px;border-radius:12px;margin-bottom:16px;font-size:0.88rem;}
        .review-section{display:flex;flex-direction:column;gap:12px;margin-bottom:20px;}
        .review-block{background:var(--bg-hover,#f9fafb);border-radius:14px;padding:14px 16px;border:1px solid var(--border,#e5e7eb);position:relative;}
        .review-block-title{font-weight:800;font-size:0.9rem;color:var(--text,#111);margin:0 0 4px;}
        .review-block-text{font-size:0.88rem;color:var(--text-muted,#666);margin:0;}
        .edit-link{position:absolute;top:14px;right:14px;background:none;border:none;color:#FF6B35;font-weight:700;font-size:0.82rem;cursor:pointer;text-decoration:underline;}
        .review-items{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
        .review-item{display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-hover,#f9fafb);border-radius:12px;}
        .review-item-img{width:48px;height:48px;border-radius:10px;overflow:hidden;background:var(--bg-card,#fff);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;}
        .review-item-img img{width:100%;height:100%;object-fit:cover;}
        .review-item-name{font-size:0.88rem;font-weight:700;color:var(--text,#111);margin:0 0 2px;}
        .review-item-qty{font-size:0.78rem;color:var(--text-muted,#888);margin:0;}
        .review-item-price{margin-left:auto;font-weight:800;font-size:0.9rem;color:var(--text,#111);}
        .checkout-summary{background:var(--bg-card,#fff);border-radius:20px;padding:22px;border:1px solid var(--border,#e5e7eb);position:sticky;top:80px;}
        .summary-title{font-family:'Playfair Display',Georgia,serif;font-size:1.1rem;font-weight:800;color:var(--text,#111);margin:0 0 16px;}
        .summary-items{display:flex;flex-direction:column;gap:8px;margin-bottom:14px;}
        .summary-item{display:flex;justify-content:space-between;font-size:0.82rem;color:var(--text,#444);}
        .summary-item-name{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .summary-divider{height:1px;background:var(--border,#e5e7eb);margin-bottom:12px;}
        .summary-row{display:flex;justify-content:space-between;font-size:0.88rem;color:var(--text,#444);margin-bottom:8px;}
        .free-ship{color:#16a34a;font-weight:700;}
        .summary-total{display:flex;justify-content:space-between;font-size:1.1rem;font-weight:900;color:var(--text,#111);border-top:1px solid var(--border,#e5e7eb);padding-top:12px;margin-top:4px;}
        @media(max-width:768px){.checkout-layout{grid-template-columns:1fr;}.ch-step-line{width:30px;}.ch-step-label{display:none;}.addr-form,.card-form{grid-template-columns:1fr;}}
      `}</style>
    </div>
  );
}