'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

export default function WelcomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams?.get('username');
  const isFirstLogin = searchParams?.get('firstLogin') === 'true';

  useEffect(() => {
    console.log('Welcome page mounted');
    console.log('Search params:', Object.fromEntries(searchParams?.entries() || []));
    console.log('Username from params:', username);
    
    if (!username) {
      console.log('No username found, redirecting to login');
      router.push('/login');
      return;
    }

    // Hide welcome message after 3 seconds
    const timer = setTimeout(() => {
      console.log('Hiding welcome message');
      setShowWelcome(false);
      // Show calendar after welcome message disappears
      setTimeout(() => {
        console.log('Showing calendar');
        setShowCalendar(true);
      }, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [username, router, searchParams]);

  if (!username) {
    console.log('Rendering null - no username');
    return null;
  }

  console.log('Rendering welcome page with username:', username);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        {/* Glassmorphic background effects */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <AnimatePresence mode="wait">
          {showWelcome && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl shadow-xl border border-white/20 relative text-center"
            >
              <h1 className="text-4xl font-light text-gray-900 mb-4">
                {isFirstLogin ? 'Hello' : 'Welcome Back'}, {username}!
              </h1>
              <p className="text-gray-500 text-lg">
                {isFirstLogin ? 'We\'re excited to have you here!' : 'Great to see you again!'}
              </p>
            </motion.div>
          )}

          {showCalendar && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl shadow-xl border border-white/20 relative"
            >
              <h2 className="text-2xl font-light text-gray-900 mb-6">Your Study Calendar</h2>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-white/50 border border-gray-200 rounded-lg p-2 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <div className="text-sm text-gray-500">{index + 1}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
} 