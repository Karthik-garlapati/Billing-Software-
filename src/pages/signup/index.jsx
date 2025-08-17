import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import NotificationBar from '../../components/ui/NotificationBar';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, loading, authError, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData?.fullName?.trim()) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter your full name.',
        autoHide: true
      });
      return false;
    }

    if (!formData?.companyName?.trim()) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter your company name.',
        autoHide: true
      });
      return false;
    }

    if (!formData?.email) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter your email address.',
        autoHide: true
      });
      return false;
    }

    if (formData?.password?.length < 6) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long.',
        autoHide: true
      });
      return false;
    }

    if (formData?.password !== formData?.confirmPassword) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Validation Error',
        message: 'Passwords do not match.',
        autoHide: true
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const { user, error } = await signUp(
      formData?.email,
      formData?.password,
      {
        fullName: formData?.fullName,
        companyName: formData?.companyName,
        role: 'user'
      }
    );
    
    if (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Signup Failed',
        message: error?.message || authError || 'Failed to create account. Please try again.',
        autoHide: false
      });
    } else if (user) {
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to BillTracker Pro! Please check your email to verify your account.',
        autoHide: false
      });
      
      setTimeout(() => {
        addNotification({
          id: Date.now() + 1,
          type: 'info',
          title: 'Redirecting...',
          message: 'Taking you to the login page.',
          autoHide: true
        });
        navigate('/login');
      }, 3000);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleDismissNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">B</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
            Create your BillTracker Pro account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Start managing your invoices professionally
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={formData?.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
                Company Name
              </label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                autoComplete="organization"
                required
                value={formData?.companyName}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                className="mt-1"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={formData?.password}
                onChange={handleInputChange}
                placeholder="Create a password (min. 6 characters)"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData?.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:text-primary/80">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:text-primary/80">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>

        {/* Features Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
          <h3 className="text-sm font-medium text-foreground mb-2">What you'll get:</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Create and manage professional invoices</p>
            <p>• Track payments and outstanding balances</p>
            <p>• Organize client information and history</p>
            <p>• Generate reports and insights</p>
            <p>• Secure cloud storage for all your data</p>
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

export default Signup;