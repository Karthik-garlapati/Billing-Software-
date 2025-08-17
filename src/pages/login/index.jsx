import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import NotificationBar from '../../components/ui/NotificationBar';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, loading, authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [notifications, setNotifications] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any existing auth errors when user starts typing
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.email || !formData?.password) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields.',
        autoHide: true
      });
      return;
    }

    const { user, error } = await signIn(formData?.email, formData?.password);
    
    if (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Login Failed',
        message: error?.message || authError || 'Please check your credentials and try again.',
        autoHide: false
      });
    } else if (user) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Welcome Back!',
        message: 'Successfully logged in. Redirecting to dashboard...',
        autoHide: true
      });
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'admin@billtracker.com',
      password: 'admin123'
    });
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Demo Credentials Filled',
      message: 'Click "Sign In" to try the demo account.',
      autoHide: true
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">B</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Sign in to BillTracker Pro
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Professional billing software for your business
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData?.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData?.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link 
                to="/forgot-password" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
            >
              Try Demo Account
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up for free
              </Link>
            </span>
          </div>
        </form>

        {/* Demo Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
          <h3 className="text-sm font-medium text-foreground mb-2">Demo Account</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Email:</strong> admin@billtracker.com</p>
            <p><strong>Password:</strong> admin123</p>
            <p className="mt-2 text-amber-600">
              This demo uses real Supabase integration with sample data.
            </p>
          </div>
        </div>
      </div>
      {/* Notifications */}
      <NotificationBar
        notifications={notifications}
        onDismiss={handleDismissNotification}
        maxVisible={3}
        autoHideDuration={5000}
      />
    </div>
  );
};

export default Login;