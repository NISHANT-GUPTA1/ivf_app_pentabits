import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, User, CheckCircle, AlertTriangle, Eye, EyeOff, Stethoscope, FileText, Settings, Loader } from 'lucide-react';

interface DemoCredential {
  role: string;
  icon: React.ReactNode;
  username: string;
  password: string;
  description: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'Embryologist',
    icon: <Stethoscope className="w-5 h-5" />,
    username: 'embryologist',
    password: 'embryo123',
    description: 'View embryo assessments & morphology'
  },
  {
    role: 'Auditor',
    icon: <FileText className="w-5 h-5" />,
    username: 'auditor',
    password: 'audit123',
    description: 'Access audit logs & compliance reports'
  },
  {
    role: 'Admin',
    icon: <Settings className="w-5 h-5" />,
    username: 'admin',
    password: 'admin123',
    description: 'Full system & user management'
  }
];

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      // Error is handled by the context
    }
  };

  const handleDemoCredential = (credential: DemoCredential) => {
    setUsername(credential.username);
    setPassword(credential.password);
    setSelectedRole(credential.role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Left Panel - Branding & Information */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-rose-700 via-rose-600 to-pink-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle abstract background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Branding */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center p-1">
                <img src="/embryo-logo.jpeg" alt="EMBRYA Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">EMBRYA</h1>
            </div>
            <p className="text-lg text-blue-100 font-light">AI-Powered Embryo Assessment</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-12">
            <div className="flex gap-3">
              <div className="w-1 bg-gradient-to-b from-purple-400 to-transparent rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-sm mb-1">Explainable AI</p>
                <p className="text-sm text-blue-100">Heatmaps and feature importance for every decision</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-1 bg-gradient-to-b from-purple-400 to-transparent rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-sm mb-1">Complete Audit Trail</p>
                <p className="text-sm text-blue-100">Full compliance logging for every action</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-1 bg-gradient-to-b from-purple-400 to-transparent rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-sm mb-1">Clinical Integration</p>
                <p className="text-sm text-blue-100">Seamless IVF lab workflow support with risk indicators</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Credibility Footer */}
        <div className="relative z-10 pt-8 border-t border-white/10 space-y-2 text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-300" />
            <span>Explainable AI Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-300" />
            <span>Human-in-the-Loop Decision Support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-300" />
            <span>Role-Based Access Control & Audit Logging</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-slate-100">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Clinical Login</h2>
              <p className="text-sm text-slate-500">Authorized IVF personnel only</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5 mb-8">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-50 border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  'Secure Login'
                )}
              </Button>

              {/* Audit Compliance Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  All actions are logged for audit compliance and regulatory compliance
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Click a role to auto-fill demo credentials, then press Login
              </p>
            </form>

            {/* Demo Credentials Section */}
            <div className="border-t border-slate-200 pt-8">
              <p className="text-sm font-semibold text-slate-700 mb-4">Demo Access</p>
              <div className="space-y-3">
                {DEMO_CREDENTIALS.map((credential) => (
                  <button
                    key={credential.role}
                    onClick={() => handleDemoCredential(credential)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedRole === credential.role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-blue-600">
                            {credential.icon}
                          </div>
                          <p className="font-medium text-slate-900 text-sm">{credential.role}</p>
                        </div>
                        <p className="text-xs text-slate-500">{credential.description}</p>
                      </div>
                      {selectedRole === credential.role && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
            </div>
          </div>

          {/* Mobile Branding - Visible only on small screens */}
          <div className="lg:hidden mt-8 text-center">
            <div className="inline-flex items-center gap-2 justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">EMBRYA</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">AI-Powered Embryo Assessment</p>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Explainable AI Enabled</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Complete Audit Trail</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};