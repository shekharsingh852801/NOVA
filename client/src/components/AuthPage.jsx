import { useState } from "react";
import { ArrowIcon, UserIcon, MailIcon, LockIcon, EyeIcon, GoogleIcon } from "./Icons.jsx";
import { loginCustomer, registerCustomer } from "../api/api.js";
import { useStore } from "../context/StoreContext.jsx";

export default function AuthPage({ onNavigate, onLogin }) {
  const { replaceCart } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isForgot) {
        const { forgotPassword } = await import("../api/api.js");
        const res = await forgotPassword(formData.email);
        setSuccessMsg(res.message || "Reset link sent.");
      } else {
        let data;
        if (isLogin) {
          data = await loginCustomer(formData.email, formData.password);
        } else {
          data = await registerCustomer(formData.name, formData.email, formData.password);
        }
        
        localStorage.setItem("nova_customer_token", data.token);
        localStorage.setItem("nova_customer", JSON.stringify(data.customer));
        
        if (data.customer.cart && data.customer.cart.length > 0) {
          replaceCart(data.customer.cart);
        }

        onLogin(data.customer);
        onNavigate("account");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isForgot) {
    return (
      <main className="auth-split">
        <div className="auth-split__image-side">
          <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90" alt="" className="auth-split__bg" />
          <div className="auth-split__image-overlay">
            <div className="auth-split__logo">NOVA<br/><span>WEAR TOMORROW</span></div>
            <div className="auth-split__image-content">
              <h2><i>More Than</i><br/>Just Fashion</h2>
              <hr />
              <p>Be part of a movement. Style, comfort and a better tomorrow.</p>
              <div className="auth-split__pagination">&mdash; 01&nbsp;&nbsp;02&nbsp;&nbsp;03</div>
            </div>
          </div>
        </div>
        <div className="auth-split__form-side">
          <header className="auth-split__header">
            <span>Remember your password?</span>
            <button className="text-action" style={{ color: "var(--white)" }} onClick={() => setIsForgot(false)}>
              Sign In <ArrowIcon />
            </button>
          </header>
          <div className="auth-split__form-container">
            <p className="eyebrow eyebrow--light">RECOVER ACCOUNT</p>
            <h1 className="section-heading section-heading--light">Reset Password</h1>
            <p className="auth-split__desc">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="auth-split__field">
                <label>Email Address</label>
                <div className="auth-split__input-wrapper">
                   <MailIcon className="auth-split__icon" />
                   <input name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={update} required />
                </div>
              </div>
              
              {error && <p className="form-error">{error}</p>}
              {successMsg && <p className="form-success" style={{ color: "var(--olive)", fontSize: "13px", marginTop: "12px" }}>{successMsg}</p>}
              
              <button type="submit" className="btn btn--light auth-split__submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"} <ArrowIcon />
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-split">
      <div className="auth-split__image-side">
        <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=90" alt="" className="auth-split__bg" />
        <div className="auth-split__image-overlay">
          <div className="auth-split__logo">NOVA<br/><span>WEAR TOMORROW</span></div>
          <div className="auth-split__image-content">
            <h2><i>More Than</i><br/>Just Fashion</h2>
            <hr />
            <p>Be part of a movement. Style, comfort and a better tomorrow.</p>
            <div className="auth-split__pagination">&mdash; 01&nbsp;&nbsp;02&nbsp;&nbsp;03</div>
          </div>
        </div>
      </div>
      
      <div className="auth-split__form-side">
          <header className="auth-split__header">
          <span>{isLogin ? "New Here?" : "Already have an account?"}</span>
          <button className="text-action" style={{ color: "var(--white)" }} onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Create Account" : "Sign In"} <ArrowIcon />
          </button>
        </header>

        <div className="auth-split__form-container">
          <p className="eyebrow eyebrow--light">{isLogin ? "WELCOME BACK" : "WELCOME TO NOVA"}</p>
          <h1 className="section-heading section-heading--light">{isLogin ? "Login to NOVA" : "Create Account"}</h1>
          <p className="auth-split__desc">
            {isLogin 
              ? "Your style journey continues. Access your account for a seamless shopping experience."
              : "Join us to check out faster, track your orders, and save favorites."}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-split__field">
                <label>Full Name</label>
                <div className="auth-split__input-wrapper">
                   <UserIcon className="auth-split__icon" />
                   <input name="name" type="text" placeholder="John Doe" value={formData.name} onChange={update} required />
                </div>
              </div>
            )}
            
            <div className="auth-split__field">
              <label>Email Address</label>
              <div className="auth-split__input-wrapper">
                 <MailIcon className="auth-split__icon" />
                 <input name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={update} required />
              </div>
            </div>

            <div className="auth-split__field">
              <label>Password</label>
              <div className="auth-split__input-wrapper">
                 <LockIcon className="auth-split__icon" />
                 <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={update} required minLength={6} />
                 <button type="button" className="auth-split__reveal" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility"><EyeIcon /></button>
              </div>
            </div>

            {isLogin && (
              <div className="auth-split__actions">
                <label className="auth-split__checkbox">
                  <input type="checkbox" /> <span className="auth-split__checkbox-custom"></span> Remember me
                </label>
                <button type="button" className="text-action" style={{ color: "var(--white)" }} onClick={() => { setIsForgot(true); setError(""); setSuccessMsg(""); }}>Forgot password?</button>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--light auth-split__submit" disabled={loading}>
              {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")} <ArrowIcon />
            </button>

            <div className="auth-split__divider"><span>OR</span></div>
            
            <button type="button" className="btn btn--ghost-light auth-split__google">
              <GoogleIcon /> Continue with Google
            </button>
            
            <p className="auth-split__secure"><LockIcon /> Your data is safe with us.</p>
          </form>
        </div>
      </div>
    </main>
  );
}
