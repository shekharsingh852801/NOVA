import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'grid', 
      placeItems: 'center', 
      background: 'var(--black)',
      padding: '24px'
    }}>
      <div className="admin-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="brand" style={{ fontSize: '2rem', marginBottom: '8px' }}>NOVA</h1>
          <p style={{ color: 'var(--muted-on-dark)' }}>Sign in to your admin dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(255, 110, 110, 0.15)', color: '#ff9b9b', border: '1px solid rgba(255, 110, 110, 0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Email address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@nova.com"
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <a href="#" style={{ fontSize: '12px', color: 'var(--muted-on-dark)', textDecoration: 'underline' }}>Forgot?</a>
            </div>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="primary-button" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--muted-on-dark)' }}>
          By signing in, you agree to our Terms of Service.
        </div>
      </div>
    </div>
  );
}
