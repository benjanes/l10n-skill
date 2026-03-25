import React, { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Sign In</h1>
      <p>Welcome back! Please sign in to your account.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Sign In</button>
        <a href="/forgot-password">Forgot your password?</a>
        <p>
          Don't have an account? <a href="/register">Create one here</a>
        </p>
      </form>
    </div>
  );
}
