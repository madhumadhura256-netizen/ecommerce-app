import { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const from = location.state?.from || "/";

  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-logo">🛒</span>
          <h1 className="brand-name">ShopZen</h1>
          <p className="brand-tagline">Your one-stop shop for everything</p>
        </div>
        <div className="auth-illustration">
          {["🍎","👟","📱","🍫","💄","🥦"].map((e,i) => (
            <span key={i} className="float-emoji" style={{animationDelay:`${i*0.4}s`}}>{e}</span>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-sub">Sign in to your ShopZen account</p>
          </div>

          {apiError && <div className="alert-error">⚠️ {apiError}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className={`input-wrap ${errors.email ? "error" : ""}`}>
                <span className="input-icon">✉️</span>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  className="auth-input" autoComplete="email"
                />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className={`input-wrap ${errors.password ? "error" : ""}`}>
                <span className="input-icon">🔒</span>
                <input
                  type={showPass ? "text" : "password"} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" className="auth-input" autoComplete="current-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="field-row">
              <label className="checkbox-label">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="social-btns">
            <button className="btn-social">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register" className="auth-link">Sign up free</Link>
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
          background: linear-gradient(145deg, #1a1a2e, #16213e, #0f3460);
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 70%, rgba(255,107,53,0.2) 0%, transparent 50%);
        }
        .auth-brand { text-align: center; position: relative; z-index: 1; }
        .brand-logo { font-size: 4rem; display: block; margin-bottom: 12px; }
        .brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.8rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -1px;
        }
        .brand-tagline { color: rgba(255,255,255,0.6); font-size: 1rem; margin: 0; }

        .auth-illustration {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          margin-top: 60px;
          max-width: 240px;
          position: relative;
          z-index: 1;
        }
        .float-emoji {
          font-size: 2.4rem;
          animation: floatEmoji 3s ease-in-out infinite alternate;
          display: inline-block;
        }
        @keyframes floatEmoji {
          from { transform: translateY(0) rotate(-5deg); }
          to   { transform: translateY(-12px) rotate(5deg); }
        }

        /* ── Right panel ── */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          /* Right side background follows theme */
          background: var(--bg-primary, #f8fafc);
        }

        /* ── Card ── */
        .auth-card {
          width: 100%;
          max-width: 420px;
          background: var(--bg-card, #ffffff);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          border: 1px solid var(--border-default, #e5e7eb);
        }

        .auth-header { margin-bottom: 28px; }
        .auth-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.9rem;
          font-weight: 800;
          color: var(--text-primary, #888);
          margin: 0 0 6px;
        }
        .auth-sub { color: var(--text-muted, #888); margin: 0; font-size: 0.95rem; }

        /* ── Error banner ── */
        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.88rem;
          font-weight: 500;
        }

        /* ── Form ── */
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary, #717171);
        }

        /* ── Input wrapper ── */
        .input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
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
        .input-icon { font-size: 1rem; user-select: none; flex-shrink: 0; }

        /* ── THE KEY FIX: auth-input always reads from CSS variables ── */
        .auth-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 13px 0;
          font-size: 0.95rem;
          /* Use CSS variable so it works in both light AND dark mode */
          color: var(--text-primary, #111);
          /* Tell browser to use correct color scheme for cursor & selection */
          color-scheme: light;
          width: 100%;
          min-width: 0;
        }
        .auth-input::placeholder {
          color: var(--text-muted, #9ca3af);
          opacity: 1;
        }

        /* ── Dark mode overrides scoped to .dark on <html> ── */
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
        .dark .auth-title { color: var(--text-primary, #F0EFE9); }
        :global(.dark) .auth-sub,
        .dark .auth-sub   { color: var(--text-muted, #6B6860); }
        :global(.dark) .field-label,
        .dark .field-label { color: var(--text-primary, #F0EFE9); }
        :global(.dark) .checkbox-label,
        .dark .checkbox-label { color: var(--text-muted, #6B6860); }
        :global(.dark) .auth-switch,
        .dark .auth-switch { color: var(--text-muted, #6B6860); }
        :global(.dark) .btn-back,
        .dark .btn-back {
          color: var(--text-primary, #F0EFE9);
          border-color: var(--border-default, rgba(255,255,255,0.08));
        }
        :global(.dark) .btn-back:hover,
        .dark .btn-back:hover {
          background: var(--bg-secondary, #161614);
        }
        :global(.dark) .btn-social,
        .dark .btn-social {
          background: var(--bg-secondary, #161614);
          border-color: var(--border-default, rgba(255,255,255,0.08));
          color: var(--text-primary, #F0EFE9);
        }
        :global(.dark) .btn-social:hover,
        .dark .btn-social:hover {
          background: var(--bg-tertiary, #1E1E1B);
        }
        :global(.dark) .auth-divider,
        .dark .auth-divider { color: var(--text-muted, #6B6860); }
        :global(.dark) .auth-divider::before,
        :global(.dark) .auth-divider::after,
        .dark .auth-divider::before,
        .dark .auth-divider::after {
          background: var(--border-default, rgba(255,255,255,0.08));
        }

        /* Autofill override — prevents browser painting white bg over dark input */
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
        .field-row { display: flex; justify-content: space-between; align-items: center; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-muted, #666); cursor: pointer; }
        .forgot-link { font-size: 0.85rem; color: #FF6B35; text-decoration: none; font-weight: 600; }

        .btn-auth {
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #FF6B35, #f43f5e);
          color: #fff;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
        }
        .btn-auth:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-auth:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          width: 22px; height: 22px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
          color: var(--text-muted, #aaa);
          font-size: 0.85rem;
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px;
          background: var(--border-default, #e5e7eb);
        }

        .social-btns { display: flex; flex-direction: column; gap: 10px; }
        .btn-social {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 12px; border-radius: 12px;
          border: 1.5px solid var(--border-default, #d1d5db);
          background: var(--bg-card, #fff);
          color: var(--text-primary, #111);
          font-weight: 600; font-size: 0.92rem;
          cursor: pointer; transition: background 0.2s;
        }
        .btn-social:hover { background: var(--bg-secondary, #f3f4f6); }

        .auth-switch { text-align: center; margin: 20px 0 0; font-size: 0.9rem; color: var(--text-muted, #888); }
        .auth-link { color: #FF6B35; font-weight: 700; text-decoration: none; }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-card { padding: 28px 20px; }
        }
      `}</style>
    </div>
  );
}