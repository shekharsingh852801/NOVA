import { useState, useEffect } from "react";
import { ArrowIcon } from "./Icons.jsx";
import { resetPassword } from "../api/api.js";

export default function ResetPassword({ onNavigate }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extract token from hash
    const hash = window.location.hash;
    const parts = hash.split("/");
    if (parts.length >= 3 && parts[1] === "reset-password") {
      setToken(parts[2]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="commerce-page auth-page" style={{ maxWidth: "480px", margin: "0 auto", padding: "120px 24px", textAlign: "center" }}>
        <p className="eyebrow eyebrow--dark">NOVA / SUCCESS</p>
        <h1>Password Reset</h1>
        <p className="page-lede" style={{ marginBottom: "32px", color: "green" }}>
          Your password has been successfully reset!
        </p>
        <button className="btn btn--dark" onClick={() => { window.location.hash = "#account"; }}>
          Go to Login <ArrowIcon />
        </button>
      </main>
    );
  }

  return (
    <main className="commerce-page auth-page" style={{ maxWidth: "480px", margin: "0 auto", padding: "120px 24px" }}>
      <p className="eyebrow eyebrow--dark">NOVA / RECOVER</p>
      <h1>New Password</h1>
      <p className="page-lede" style={{ marginBottom: "32px" }}>
        Enter your new password below.
      </p>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <label>
          New Password
          <input 
            name="newPassword" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            required 
            minLength={6} 
          />
        </label>
        
        {error && <p className="form-error" style={{ color: "red", fontSize: "14px", marginTop: "12px" }}>{error}</p>}
        
        <button type="submit" className="btn btn--dark" disabled={loading || !token} style={{ width: "100%", marginTop: "24px" }}>
          {loading ? "Resetting..." : "Reset Password"} <ArrowIcon />
        </button>
      </form>
    </main>
  );
}
