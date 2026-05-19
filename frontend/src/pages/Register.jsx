import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const steps = ["Personal Info", "Contact", "Security"];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const rules = {
    name:            v => !v.trim() ? "Full name required" : v.trim().length < 2 ? "At least 2 characters" : "",
    email:           v => !v.trim() ? "Email required" : !/\S+@\S+\.\S+/.test(v) ? "Invalid email" : "",
    phone:           v => !v.trim() ? "Phone required" : !/^\d{10}$/.test(v.replace(/\s/g,"")) ? "Enter 10-digit number" : "",
    password:        v => !v ? "Password required" : v.length < 6 ? "Min 6 characters" : "",
    confirmPassword: v => !v ? "Please confirm your password" : v !== form.password ? "Passwords don't match" : "",
  };

  const fieldsPerStep = [["name"], ["email", "phone"], ["password", "confirmPassword"]];

  const validateStep = () => {
    const e = {};
    fieldsPerStep[step].forEach(f => {
      const msg = rules[f](form[f]);
      if (msg) e[f] = msg;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: "" }));
    setApiError("");
  };

  const next = () => { if (validateStep()) setStep(p => Math.min(p + 1, 2)); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    setApiError("");
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password });
      navigate("/");
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. This email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strengthLabel = ["","Weak","Fair","Good","Strong"];
  const strengthColor = ["","#ef4444","#f59e0b","#22c55e","#16a34a"];
  const s = strength();

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-logo">🛒</span>
          <h1 className="brand-name">ShopZen</h1>
          <p className="brand-tagline">Join millions of happy shoppers</p>
        </div>
        <div className="perks">
          {["🎁 Exclusive member deals","🚚 Free delivery on first order","⭐ Early access to sales","💳 Secure checkout always"].map(p => (
            <div key={p} className="perk-item">{p}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-sub">Step {step + 1} of {steps.length} — {steps[step]}</p>
          </div>

          {/* Progress bar */}
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>

          {/* Step indicators */}
          <div className="steps-row">
            {steps.map((label, i) => (
              <div key={label} className={`step-dot ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}>
                {i < step ? "✓" : i + 1}
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>

          {apiError && <div className="alert-error">⚠️ {apiError}</div>}

          <form onSubmit={step === 2 ? handleSubmit : e => e.preventDefault()} className="auth-form" noValidate>

            {step === 0 && (
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <div className={`input-wrap ${errors.name ? "error" : ""}`}>
                  <span className="input-icon">👤</span>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Jane Doe" className="auth-input" autoFocus />
                </div>
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
            )}

            {step === 1 && (<>
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className={`input-wrap ${errors.email ? "error" : ""}`}>
                  <span className="input-icon">✉️</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@example.com" className="auth-input" autoFocus />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
              <div className="field-group">
                <label className="field-label">Phone Number</label>
                <div className={`input-wrap ${errors.phone ? "error" : ""}`}>
                  <span className="input-icon">📱</span>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="9876543210" className="auth-input" />
                </div>
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
            </>)}

            {step === 2 && (<>
              <div className="field-group">
                <label className="field-label">Password</label>
                <div className={`input-wrap ${errors.password ? "error" : ""}`}>
                  <span className="input-icon">🔒</span>
                  <input type={showPass ? "text" : "password"} name="password"
                    value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="auth-input" autoFocus />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}
                {form.password && (
                  <div className="strength-bar-row">
                    <div className="strength-bar">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="strength-seg"
                          style={{ background: i <= s ? strengthColor[s] : "var(--border-default, #e5e7eb)" }} />
                      ))}
                    </div>
                    <span style={{ color: strengthColor[s], fontSize: "0.75rem", fontWeight: 700 }}>{strengthLabel[s]}</span>
                  </div>
                )}
              </div>
              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className={`input-wrap ${errors.confirmPassword ? "error" : ""}`}>
                  <span className="input-icon">🔐</span>
                  <input type={showPass ? "text" : "password"} name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="••••••••" className="auth-input" />
                </div>
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
              <label className="checkbox-label">
                <input type="checkbox" required /> I agree to the{" "}
                <Link to="/terms" className="auth-link">Terms</Link> &amp;{" "}
                <Link to="/privacy" className="auth-link">Privacy Policy</Link>
              </label>
            </>)}

            <div className="btn-row">
              {step > 0 && (
                <button type="button" className="btn-back" onClick={back}>← Back</button>
              )}
              {step < 2
                ? <button type="button" className="btn-auth" onClick={next}>Continue →</button>
                : <button type="submit" className="btn-auth" disabled={loading}>
                    {loading ? <span className="spinner" /> : "Create Account 🎉"}
                  </button>
              }
            </div>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          background: var(--bg-primary, #f8fafc);
        }

        /* ── Left panel ── */
        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #0f2027, #203a43, #2c5364);
          padding: 60px 40px;
          overflow: hidden;
          position: relative;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 70% 30%, rgba(255,107,53,0.18) 0%, transparent 55%);
        }
        .auth-brand { text-align: center; position: relative; z-index: 1; margin-bottom: 50px; }
        .brand-logo { font-size: 4rem; display: block; margin-bottom: 12px; }
        .brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.8rem; font-weight: 900; color: #fff; margin: 0 0 8px;
        }
        .brand-tagline { color: rgba(255,255,255,0.55); font-size: 1rem; margin: 0; }
        .perks { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }
        .perk-item {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 14px 20px;
          color: #fff;
          font-size: 0.92rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        /* ── Right panel ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: var(--bg-primary, #f8fafc);
        }

        /* ── Card ── */
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: var(--bg-card, #ffffff);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          border: 1px solid var(--border-default, #e5e7eb);
        }

        .auth-header { margin-bottom: 20px; }
        .auth-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.9rem; font-weight: 800;
          color: var(--text-primary, #676767);
          margin: 0 0 4px;
        }
        .auth-sub { color: var(--text-muted, #888); margin: 0; font-size: 0.88rem; }

        /* ── Progress ── */
        .progress-bar-wrap {
          height: 4px;
          background: var(--border-default, #e5e7eb);
          border-radius: 4px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #FF6B35, #f43f5e);
          border-radius: 4px;
          transition: width 0.4s ease;
        }

        /* ── Step dots ── */
        .steps-row { display: flex; justify-content: space-between; margin-bottom: 28px; }
        .step-dot {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid var(--border-default, #d1d5db);
          color: var(--text-muted, #aaa);
          font-size: 0.8rem; font-weight: 700;
          justify-content: center;
          position: relative;
          transition: all 0.3s;
        }
        .step-dot.active { border-color: #FF6B35; color: #FF6B35; }
        .step-dot.done   { background: #FF6B35; border-color: #FF6B35; color: #fff; }
        .step-label {
          position: absolute; top: 36px;
          font-size: 0.68rem; font-weight: 600;
          color: var(--text-muted, #aaa);
          white-space: nowrap;
        }
        .step-dot.active .step-label,
        .step-dot.done .step-label { color: #FF6B35; }

        /* ── Error banner ── */
        .alert-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626;
          padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 0.88rem;
        }

        /* ── Form ── */
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.85rem; font-weight: 700; color: var(--text-primary, #515050); }

        /* ── Input wrapper ── */
        .input-wrap {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid var(--border-default, #d1d5db);
          border-radius: 12px;
          padding: 0 14px;
          background: var(--bg-secondary, #f9fafb);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-wrap:focus-within {
          border-color: #FF6B35;
          box-shadow: 0 0 0 3px rgba(255,107,53,0.12);
        }
        .input-wrap.error { border-color: #ef4444; }
        .input-icon { font-size: 1rem; flex-shrink: 0; }

        /* ── THE KEY FIX: always use CSS variable for text color ── */
        .auth-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 13px 0;
          font-size: 0.95rem;
          color: var(--text-primary, #111);
          color-scheme: light;
          width: 100%;
          min-width: 0;
        }
        .auth-input::placeholder {
          color: var(--text-muted, #9ca3af);
          opacity: 1;
        }

        /* ── Dark mode overrides ── */
        :global(.dark) .auth-input,
        .dark .auth-input {
          color: var(--text-primary, #F0EFE9) !important;
          color-scheme: dark;
        }
        :global(.dark) .auth-input::placeholder,
        .dark .auth-input::placeholder {
          color: var(--text-muted, #6B6860) !important;
        }
        :global(.dark) .input-wrap,
        .dark .input-wrap {
          background: var(--bg-secondary, #161614);
          border-color: var(--border-default, rgba(255,255,255,0.08));
        }
        :global(.dark) .auth-card,
        .dark .auth-card {
          background: var(--bg-card, #1A1A17);
          border-color: var(--border-default, rgba(255,255,255,0.08));
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        :global(.dark) .auth-right,
        .dark .auth-right {
          background: var(--bg-primary, #0F0F0D);
        }
        :global(.dark) .auth-title,
        .dark .auth-title   { color: var(--text-primary, #F0EFE9); }
        :global(.dark) .auth-sub,
        .dark .auth-sub     { color: var(--text-muted, #6B6860); }
        :global(.dark) .field-label,
        .dark .field-label  { color: var(--text-primary, #F0EFE9); }
        :global(.dark) .checkbox-label,
        .dark .checkbox-label { color: var(--text-muted, #6B6860); }
        :global(.dark) .auth-switch,
        .dark .auth-switch  { color: var(--text-muted, #6B6860); }
        :global(.dark) .step-dot,
        .dark .step-dot     { border-color: var(--border-default, rgba(255,255,255,0.08)); color: var(--text-muted, #6B6860); }
        :global(.dark) .progress-bar-wrap,
        .dark .progress-bar-wrap { background: var(--border-default, rgba(255,255,255,0.08)); }
        :global(.dark) .btn-back,
        .dark .btn-back {
          color: var(--text-primary, #F0EFE9);
          border-color: var(--border-default, rgba(255,255,255,0.08));
        }
        :global(.dark) .btn-back:hover,
        .dark .btn-back:hover { background: var(--bg-secondary, #161614); }

        /* Autofill override */
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--text-primary, #111) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--bg-secondary, #f9fafb) inset !important;
          transition: background-color 5000s ease-in-out 0s;
          caret-color: var(--text-primary, #111);
        }
        :global(.dark) .auth-input:-webkit-autofill,
        :global(.dark) .auth-input:-webkit-autofill:hover,
        :global(.dark) .auth-input:-webkit-autofill:focus,
        .dark .auth-input:-webkit-autofill,
        .dark .auth-input:-webkit-autofill:hover,
        .dark .auth-input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--text-primary, #F0EFE9) !important;
          -webkit-box-shadow: 0 0 0px 1000px var(--bg-secondary, #161614) inset !important;
          caret-color: var(--text-primary, #F0EFE9);
        }

        .toggle-pass { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0; flex-shrink: 0; }
        .field-error { font-size: 0.78rem; color: #ef4444; margin: 0; }

        /* Strength meter */
        .strength-bar-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
        .strength-bar { display: flex; gap: 4px; flex: 1; }
        .strength-seg { flex: 1; height: 4px; border-radius: 4px; transition: background 0.3s; }

        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.84rem; color: var(--text-muted, #666); cursor: pointer; }
        .auth-link { color: #FF6B35; font-weight: 700; text-decoration: none; }

        .btn-row { display: flex; gap: 12px; }
        .btn-back {
          padding: 14px 20px; border-radius: 12px;
          border: 1.5px solid var(--border-default, #d1d5db);
          background: transparent;
          color: var(--text-primary, #a04a2b);
          font-weight: 700; cursor: pointer; font-size: 0.95rem;
          transition: background 0.2s;
        }
        .btn-back:hover { background: var(--bg-secondary, #f3f4f6); }
        .btn-auth {
          flex: 1; padding: 14px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #FF6B35, #f43f5e);
          color: #fff; font-weight: 800; font-size: 1rem; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; min-height: 50px;
        }
        .btn-auth:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-auth:disabled { opacity: 0.65; cursor: not-allowed; }
        .spinner {
          width: 22px; height: 22px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-switch { text-align: center; margin: 20px 0 0; font-size: 0.9rem; color: var(--text-muted, #888); }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-card { padding: 28px 20px; }
        }
      `}</style>
    </div>
  );
}