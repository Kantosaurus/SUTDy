'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginExiting, setIsLoginExiting] = useState(false);
  const [isCreateAccountExiting, setIsCreateAccountExiting] = useState(false);
  const [isForgotPasswordExiting, setIsForgotPasswordExiting] = useState(false);
  const router = useRouter();

  // Form states
  const [loginForm, setLoginForm] = useState<{
    username: string;
    password: string;
  }>({
    username: '',
    password: '',
  });
  const [createAccountForm, setCreateAccountForm] = useState<{
    email: string;
    username: string;
    password: string;
  }>({
    email: '',
    username: '',
    password: '',
  });
  const [forgotPasswordForm, setForgotPasswordForm] = useState<{
    email: string;
  }>({
    email: '',
  });

  // Validation states
  const [loginErrors, setLoginErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [createAccountErrors, setCreateAccountErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
  }>({});
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState<{
    email?: string;
  }>({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errors: {
      username?: string;
      password?: string;
    } = {};
    if (!loginForm.username) errors.username = 'Username is required';
    else if (!validateUsername(loginForm.username)) errors.username = 'Please enter a valid username';
    if (!loginForm.password) errors.password = 'Password is required';
    else if (!validatePassword(loginForm.password)) errors.password = 'Password must be at least 8 characters';
    
    setLoginErrors(errors);
    if (Object.keys(errors).length === 0) {
      // Check for specific credentials
      if (loginForm.username === 'Kantosaurus' && loginForm.password === 'Kantosaurus9495') {
        console.log('Login successful');
        try {
          // Close the login modal first
          handleCloseModal(setShowLogin, setIsLoginExiting);
          await router.push(`/welcome?username=${encodeURIComponent(loginForm.username)}&firstLogin=false`);
          // Add fallback navigation
          if (typeof window !== 'undefined') {
            window.location.href = `/welcome?username=${encodeURIComponent(loginForm.username)}&firstLogin=false`;
          }
        } catch (error) {
          console.error('Navigation error:', error);
          setLoginErrors({ password: 'Failed to redirect. Please try again.' });
        }
      } else {
        setLoginErrors({ password: 'Invalid username or password' });
      }
    }
  };

  const handleCreateAccountSubmit = (e) => {
    e.preventDefault();
    const errors: {
      email?: string;
      username?: string;
      password?: string;
    } = {};
    if (!createAccountForm.email) errors.email = 'Email is required';
    else if (!validateEmail(createAccountForm.email)) errors.email = 'Please enter a valid email';
    if (!createAccountForm.username) errors.username = 'Username is required';
    else if (!validateUsername(createAccountForm.username)) errors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
    if (!createAccountForm.password) errors.password = 'Password is required';
    else if (!validatePassword(createAccountForm.password)) errors.password = 'Password must be at least 8 characters';
    
    setCreateAccountErrors(errors);
    if (Object.keys(errors).length === 0) {
      // Handle successful account creation
      console.log('Account creation successful');
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    const errors: {
      email?: string;
    } = {};
    if (!forgotPasswordForm.email) errors.email = 'Email is required';
    else if (!validateEmail(forgotPasswordForm.email)) errors.email = 'Please enter a valid email';
    
    setForgotPasswordErrors(errors);
    if (Object.keys(errors).length === 0) {
      // Handle password reset request
      console.log('Password reset email sent');
    }
  };

  const handleCloseModal = (setModalState, setIsExiting) => {
    setIsExiting(true);
    setTimeout(() => {
      setModalState(false);
      setIsExiting(false);
    }, 300); // Match this with the animation duration
  };

  return (
    <main className="min-h-screen bg-white relative">
      {/* Navigation */}
      <nav className="absolute top-0 right-0 p-6 z-10">
        <button 
          onClick={() => setShowLogin(true)}
          className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-full hover:border-gray-300 transition-all"
        >
          Log in
        </button>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl font-light text-gray-900 mb-6 tracking-tight">
            SUTDy
          </h1>
          <p className="text-lg text-gray-500 mb-12">
            Elevate your learning experience
          </p>
          <div className="flex justify-center gap-6">
            <button 
              onClick={() => setShowCreateAccount(true)}
              className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium tracking-wide"
            >
              Get Started
            </button>
            <button className="px-8 py-3 border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium tracking-wide">
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group">
            <div className="h-0.5 w-12 bg-gray-900 mb-6 transition-all group-hover:w-24"></div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Collaborative Learning</h2>
            <p className="text-gray-500 leading-relaxed">Study together, learn better. Connect with peers and share knowledge.</p>
          </div>
          <div className="group">
            <div className="h-0.5 w-12 bg-gray-900 mb-6 transition-all group-hover:w-24"></div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Smart Organization</h2>
            <p className="text-gray-500 leading-relaxed">Keep your study materials organized and easily accessible.</p>
          </div>
          <div className="group">
            <div className="h-0.5 w-12 bg-gray-900 mb-6 transition-all group-hover:w-24"></div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Progress Tracking</h2>
            <p className="text-gray-500 leading-relaxed">Monitor your learning journey and achieve your goals.</p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {(showLogin || isLoginExiting) && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className={`relative w-full max-w-md mx-auto ${!isLoginExiting ? 'animate-modal-in' : 'animate-modal-out'}`}>
            {/* Glassmorphic Card */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10">
              {/* Close Button */}
              <button 
                onClick={() => handleCloseModal(setShowLogin, setIsLoginExiting)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-10">
                <h1 className="text-2xl font-light text-gray-900">Welcome back</h1>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-2">
                  <input
                    type="text"
                    id="username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm placeholder:text-gray-400 ${loginErrors.username ? 'ring-2 ring-red-500' : ''}`}
                    placeholder="Username"
                  />
                  {loginErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{loginErrors.username}</p>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm placeholder:text-gray-400 pr-12 ${loginErrors.password ? 'ring-2 ring-red-500' : ''}`}
                    placeholder="Password"
                  />
                  {loginErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center group cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 border border-gray-200 rounded-md transition-all peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:group-hover:bg-gray-800 group-hover:border-gray-300"></div>
                      <svg 
                        className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                  </label>
                  <button
                    onClick={() => {
                      setShowLogin(false);
                      setShowForgotPassword(true);
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors duration-200 mt-4"
                >
                  Sign in
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setShowCreateAccount(true);
                  }}
                  className="text-gray-900 hover:text-gray-700 font-medium"
                >
                  Create account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {(showCreateAccount || isCreateAccountExiting) && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className={`relative w-full max-w-md mx-auto ${!isCreateAccountExiting ? 'animate-modal-in' : 'animate-modal-out'}`}>
            {/* Glassmorphic Card */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10">
              {/* Close Button */}
              <button 
                onClick={() => handleCloseModal(setShowCreateAccount, setIsCreateAccountExiting)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-10">
                <h1 className="text-2xl font-light text-gray-900">Create Account</h1>
                <p className="text-gray-500 mt-2">Join our learning community</p>
              </div>

              <form onSubmit={handleCreateAccountSubmit} className="space-y-5">
                <div className="space-y-2">
                  <input
                    type="email"
                    id="email"
                    value={createAccountForm.email}
                    onChange={(e) => setCreateAccountForm({ ...createAccountForm, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm placeholder:text-gray-400 ${createAccountErrors.email ? 'ring-2 ring-red-500' : ''}`}
                    placeholder="Email address"
                  />
                  {createAccountErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{createAccountErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    id="username"
                    value={createAccountForm.username}
                    onChange={(e) => setCreateAccountForm({ ...createAccountForm, username: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm placeholder:text-gray-400 ${createAccountErrors.username ? 'ring-2 ring-red-500' : ''}`}
                    placeholder="Username"
                  />
                  {createAccountErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{createAccountErrors.username}</p>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={createAccountForm.password}
                    onChange={(e) => setCreateAccountForm({ ...createAccountForm, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm placeholder:text-gray-400 pr-12 ${createAccountErrors.password ? 'ring-2 ring-red-500' : ''}`}
                    placeholder="Password"
                  />
                  {createAccountErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{createAccountErrors.password}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  Create Account
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateAccount(false);
                      setShowLogin(true);
                    }}
                    className="text-gray-900 hover:text-gray-700 font-medium"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {(showForgotPassword || isForgotPasswordExiting) && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className={`relative w-full max-w-md mx-auto ${!isForgotPasswordExiting ? 'animate-modal-in' : 'animate-modal-out'}`}>
            {/* Glassmorphic Card */}
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-10">
              {/* Close Button */}
              <button 
                onClick={() => handleCloseModal(setShowForgotPassword, setIsForgotPasswordExiting)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-10">
                <h1 className="text-2xl font-light text-gray-900">Reset Password</h1>
                <p className="text-gray-500 mt-2">Enter your email to receive reset instructions</p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <input
                    type="email"
                    id="email"
                    value={forgotPasswordForm.email}
                    onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50/50 border-0 focus:border-0 focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm placeholder:text-gray-400 ${forgotPasswordErrors.email ? 'ring-2 ring-red-500' : ''}`}
                    placeholder="Email address"
                  />
                  {forgotPasswordErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{forgotPasswordErrors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  Send Reset Link
                </button>

                <p className="text-center text-sm text-gray-500">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setShowLogin(true);
                    }}
                    className="text-gray-900 hover:text-gray-700 font-medium"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 