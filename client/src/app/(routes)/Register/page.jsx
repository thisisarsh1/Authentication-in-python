'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

const HeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-deep-indigo/20 via-soft-purple/10 to-electric-blue/5" />
    <div className="absolute inset-0 bg-grid-small-white/[0.2] -z-10" />
    <div className="absolute inset-0 bg-dot-white/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
    <div className="absolute inset-0 bg-gradient-radial from-soft-purple/20 via-transparent to-transparent" />
  </div>
);

const Page = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userType, setUserType] = useState(null); // 'student' or 'organization'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_company: false,
    companyName: '', // Only for organizations
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  useEffect(() => {
    // Update is_company when userType changes
    setFormData(prev => ({
      ...prev,
      is_company: userType === 'organization'
    }));
  }, [userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Send registration data to your backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          is_company: formData.is_company,
          companyName: formData.is_company ? formData.companyName : undefined,
          userType: userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // If registration is successful, sign in the user
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        userType: userType,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Redirect based on user type
      router.push(userType === 'organization' ? '/organization/dashboard' : '/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google Sign-in error:', error);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signIn('github', { callbackUrl: '/' });
    } catch (error) {
      console.error('Github Sign-in error:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24 flex items-center justify-center">
        <HeroBackground />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-neutral-950 pt-24">
        <HeroBackground />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-3xl font-bold text-electric-blue text-center mb-12">Choose Account Type</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserType('student')}
                className="glass p-6 rounded-2xl cursor-pointer hover:bg-electric-blue/10 transition-colors"
              >
                <div className="text-4xl mb-4">👨‍🎓</div>
                <h2 className="text-xl font-semibold text-electric-blue mb-2">Student</h2>
                <p className="text-neon-cyan/80">Access personalized learning paths and connect with mentors</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUserType('organization')}
                className="glass p-6 rounded-2xl cursor-pointer hover:bg-electric-blue/10 transition-colors"
              >
                <div className="text-4xl mb-4">🏢</div>
                <h2 className="text-xl font-semibold text-electric-blue mb-2">Organization</h2>
                <p className="text-neon-cyan/80">Manage your organization's learning programs and mentors</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pt-24">
      <HeroBackground />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto glass p-8 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-electric-blue">
              {userType === 'student' ? 'Student Registration' : 'Organization Registration'}
            </h1>
            <button
              onClick={() => setUserType(null)}
              className="text-neon-cyan hover:text-electric-blue transition-colors"
            >
              Change
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {userType === 'organization' ? (
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-neon-cyan mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full glass px-4 py-2 rounded-lg border border-electric-blue/30 focus:border-electric-blue focus:outline-none bg-transparent text-white"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neon-cyan mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full glass px-4 py-2 rounded-lg border border-electric-blue/30 focus:border-electric-blue focus:outline-none bg-transparent text-white"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neon-cyan mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full glass px-4 py-2 rounded-lg border border-electric-blue/30 focus:border-electric-blue focus:outline-none bg-transparent text-white"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neon-cyan mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full glass px-4 py-2 rounded-lg border border-electric-blue/30 focus:border-electric-blue focus:outline-none bg-transparent text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neon-cyan mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full glass px-4 py-2 rounded-lg border border-electric-blue/30 focus:border-electric-blue focus:outline-none bg-transparent text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neon-cyan mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full glass px-4 py-2 rounded-lg border border-electric-blue/30 focus:border-electric-blue focus:outline-none bg-transparent text-white"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full neon-btn py-2 rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-electric-blue/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-neon-cyan bg-neutral-950">Or continue with</span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full glass hover:bg-electric-blue/10 text-electric-blue py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGithubSignIn}
              className="w-full glass hover:bg-electric-blue/10 text-electric-blue py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </motion.button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neon-cyan">
              Already have an account?{' '}
              <button onClick={() => router.push('/Login')} className="text-electric-blue hover:underline">
                Login
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Page
