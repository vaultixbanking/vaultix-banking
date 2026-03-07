import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, 
  Shield, AlertCircle, Check, ArrowRight 
} from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signupSuccess = (location.state as { signupSuccess?: boolean; accountNumber?: string })?.signupSuccess;
  const signupAccountNumber = (location.state as { accountNumber?: string })?.accountNumber;
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'username'>('email');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Detect if input is email or username
    if (name === 'identifier') {
      if (value.includes('@') && value.includes('.')) {
        setLoginMethod('email');
      } else if (value.length > 0) {
        setLoginMethod('username');
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.identifier) {
      newErrors.identifier = 'Please enter your username or email';
    } else if (loginMethod === 'email' && !/\S+@\S+\.\S+/.test(formData.identifier)) {
      newErrors.identifier = 'Please enter a valid email address';
    } else if (loginMethod === 'username' && formData.identifier.length < 3) {
      newErrors.identifier = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: formData.identifier,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials. Please try again.');
      }

      // Store auth data
      localStorage.setItem('vaultix_token', data.data.token);
      localStorage.setItem('vaultix_user', JSON.stringify(data.data.user));

      if (rememberMe) {
        localStorage.setItem('vaultix_remember', formData.identifier);
      } else {
        localStorage.removeItem('vaultix_remember');
      }

      navigate('/welcome');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setLoginError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to password reset page
    navigate('/forgot-password');
  };

  const handleQuickBioLogin = () => {
    // Implement biometric login (fingerprint/face ID)
    console.log('Biometric login initiated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-3 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Welcome Back to Vaultix
          </h1>
          <p className="text-secondary-600">
            Secure access to your financial world
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Security Badge */}
          <div className="bg-primary-50 px-6 py-3 border-b border-primary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-primary-700 font-medium">
                  256-bit Encrypted Connection
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-secondary-500">Secure</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {/* Signup Success Message */}
            {signupSuccess && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Account created successfully!</p>
                  {signupAccountNumber && (
                    <p className="text-sm text-green-600 mt-0.5">
                      Account: <span className="font-semibold tracking-wide">{signupAccountNumber}</span>
                    </p>
                  )}
                  <p className="text-sm text-green-600 mt-0.5">Please sign in to continue.</p>
                </div>
              </div>
            )}
            {/* Login Method Indicator */}
            {formData.identifier && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-medium text-secondary-500">
                  Logging in with:
                </span>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                  {loginMethod === 'email' ? 'Email' : 'Username'}
                </span>
              </div>
            )}

            {/* Identifier Field (Username/Email) */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Username or Email <span className="text-primary-600">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail className={`w-5 h-5 transition-colors ${
                    errors.identifier ? 'text-red-400' : 'text-secondary-400 group-focus-within:text-primary-500'
                  }`} />
                </div>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.identifier 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                  placeholder="Enter your username or email"
                  autoComplete="username email"
                />
                {formData.identifier && !errors.identifier && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.identifier && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.identifier}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Password <span className="text-primary-600">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock className={`w-5 h-5 transition-colors ${
                    errors.password ? 'text-red-400' : 'text-secondary-400 group-focus-within:text-primary-500'
                  }`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-sm text-secondary-600 group-hover:text-secondary-900 transition-colors">
                  Remember me
                </span>
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline transition-all"
              >
                Forgot password?
              </button>
            </div>

            {/* API Error */}
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Login failed</p>
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] focus:ring-4 focus:ring-primary-200 ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  <span>Sign In to Your Account</span>
                </div>
              )}
            </button>

            {/* Biometric Login Option */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-secondary-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleQuickBioLogin}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-primary-300 transition-all group"
                >
                  <svg className="w-5 h-5 text-secondary-600 group-hover:text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a6 6 0 0 0-6 6v6a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z" />
                    <path d="M12 14v4" />
                  </svg>
                  <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                    Fingerprint
                  </span>
                </button>
                
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-secondary-200 rounded-xl hover:bg-secondary-50 hover:border-primary-300 transition-all group"
                >
                  <svg className="w-5 h-5 text-secondary-600 group-hover:text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5.5 20v-2a6.5 6.5 0 0 1 13 0v2" />
                  </svg>
                  <span className="text-sm font-medium text-secondary-700 group-hover:text-primary-600">
                    Face ID
                  </span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-secondary-600">
                Don't have an account?{' '}
                <a 
                  href="/signup" 
                  className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1 group"
                >
                  Create an account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </p>
            </div>
          </form>

          {/* Security Notice */}
          <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-secondary-600">
                <p className="font-medium text-secondary-700 mb-1">Bank-Grade Security</p>
                <p>Your information is protected by 256-bit encryption and multi-factor authentication. Never share your password with anyone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Links */}
        <div className="mt-6 flex justify-center gap-6">
          <a href="#" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
            Privacy Policy
          </a>
          <span className="text-secondary-300">•</span>
          <a href="#" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
            Terms of Service
          </a>
          <span className="text-secondary-300">•</span>
          <a href="#" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
            Need Help?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;