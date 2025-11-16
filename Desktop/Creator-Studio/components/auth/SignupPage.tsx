import React, { useState } from 'react';

interface SignupPageProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
  onBackToHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onSwitchToLogin, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!email || !password) {
        setError('Please fill in all fields.');
        return;
    }
    localStorage.setItem('gemini-creator-studio-user', JSON.stringify({ email, password }));
    onSignup();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
             <h1 className="text-3xl font-bold text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1h14V3a1 1 0 00-1-1H5zM3 6h14v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm9.5 2a.5.5 0 000 1h2a.5.5 0 000-1h-2zM6 9a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5A.5.5 0 016 9zm.5 3.5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" clipRule="evenodd" />
                </svg>
                Creator Studio
            </h1>
            <p className="mt-2 text-gray-400">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
            >
              Create Account
            </button>
          </div>
        </form>
        <div className="text-sm text-center text-gray-400 space-y-2">
            <p>
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-purple-400 hover:underline focus:outline-none">
                Sign in
            </button>
            </p>
            <p>
            Or{' '}
            <button onClick={onBackToHome} className="font-medium text-purple-400 hover:underline focus:outline-none">
                Back to Home
            </button>
            </p>
        </div>
      </div>
    </div>
  );
};
