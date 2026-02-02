import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { LogIn, AlertCircle, Microscope } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-medical/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lavender/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Premium Card with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-1 bg-gradient-to-r from-teal-medical via-primary to-lavender" />
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
            {/* Left Section - Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-charcoal/40 via-charcoal/20 to-transparent text-white border-r border-white/10">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-medical to-teal flex items-center justify-center shadow-xl shadow-teal-medical/40">
                    <Microscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-teal-medical/80 font-bold">Embrya</p>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">ViabilitySuite</h1>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-white/70 leading-relaxed font-light">
                    Clinical-grade embryo analysis powered by advanced AI and explainable machine learning.
                  </p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-medical to-primary" />
                      <span className="text-white/60">Real-time morphology scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-medical to-primary" />
                      <span className="text-white/60">Multi-model ensemble</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-medical to-primary" />
                      <span className="text-white/60">Audit-ready reporting</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Branding */}
              <div className="text-xs text-white/40">
                <p>© 2026 Embrya Laboratory Suite</p>
                <p>Advanced Viability Analysis Platform</p>
              </div>
            </div>

            {/* Right Section - Login Form */}
            <div className="p-12 bg-gradient-to-br from-white/5 via-white/5 to-transparent">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Welcome</h2>
                <p className="text-sm text-white/60">Sign in to your lab console</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-white/90">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="admin@embryolab.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-teal-medical focus:bg-white/20 focus:ring-1 focus:ring-teal-medical/50 transition-all duration-300 backdrop-blur"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-white/90">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full h-12 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-teal-medical focus:bg-white/20 focus:ring-1 focus:ring-teal-medical/50 transition-all duration-300 backdrop-blur"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-teal-medical via-teal to-teal-medical hover:from-teal-medical/90 hover:via-teal/90 hover:to-teal-medical/90 text-white rounded-xl shadow-lg shadow-teal-medical/30 hover:shadow-xl hover:shadow-teal-medical/40 transition-all duration-300 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-2 text-xs text-white/60">
                    <p className="font-semibold text-white/80">Demo Credentials</p>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1 font-mono text-white/70">
                      <p>Email: admin@embryolab.com</p>
                      <p>Pass: admin123</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-medical/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
};
