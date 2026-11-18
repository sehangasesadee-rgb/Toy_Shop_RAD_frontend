
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Login: React.FC = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

        const response = await fetch(
         'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message || 'Login failed. Please try again.'
        );
      }

      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log("TOKEN SAVED:", !!data.data.token);
      navigate('/');

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="toy-login-page">

      <div className="toy-login-card">


        <div className="toy-login-logo">
          <img
            src="TootieToys_Kawaii_Bear_Logo.png"
            alt="Logo"
          />
        </div>

    

        <div className="toy-login-heading">
          <h1>Welcome Back!</h1>
        </div>


        <form onSubmit={handleLogin}>

          <div className="toy-login-input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="toy-login-input-group">
            <label>Password</label>

            <div className="toy-password-box">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="toy-password-toggle"
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {error && (
            <p className="toy-login-error">{error}</p>
          )}

          <button
            type="submit"
            className="toy-login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : '♡ Login ♡'}
          </button>

        </form>


        <div className="toy-login-divider">
          <span></span>
          <p>Welcome to our toy world</p>
          <span></span>
        </div>

        <p className="toy-register-text">
          Don't have an account?
          <Link to="/register"> Create Account</Link>
        </p>


      </div>

    </div>
  );
};

export default Login;
