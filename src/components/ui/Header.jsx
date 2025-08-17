import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ user = null, onUserMenuClick = () => {} }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      label: 'Simple Billing',
      path: '/simple-billing',
      icon: 'ShoppingCart',
      badge: null
    },
    {
      label: 'View Receipts',
      path: '/receipts',
      icon: 'Receipt',
      badge: null
    },
    {
      label: 'Customize Receipt',
      path: '/receipt-editor',
      icon: 'Edit',
      badge: null
    },
    {
      label: 'Manage Items',
      path: '/item-management',
      icon: 'Package',
      badge: null
    },
    {
      label: 'Advanced',
      path: '/dashboard',
      icon: 'Settings',
      badge: null
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location?.pathname === '/' || location?.pathname === '/dashboard';
    }
    return location?.pathname?.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="ShoppingCart" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground font-heading">
              Simple Billing
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`
                relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth
                ${isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
              {item?.badge && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                  {item?.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-smooth"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              {user && (
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {user?.name || 'User'}
                </span>
              )}
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg modal-shadow z-[1300]">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onUserMenuClick('profile');
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                  >
                    <Icon name="User" size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onUserMenuClick('settings');
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                  >
                    <Icon name="Settings" size={16} />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onUserMenuClick('logout');
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-smooth"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>
      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-[1100]">
          <div className="absolute inset-0 bg-black/20" onClick={toggleMobileMenu}></div>
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-card border-r border-border transition-modal">
            <div className="p-4">
              <nav className="space-y-2">
                {navigationItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`
                      flex items-center justify-between w-full p-3 rounded-lg text-left transition-smooth
                      ${isActivePath(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={item?.icon} size={20} />
                      <span className="font-medium">{item?.label}</span>
                    </div>
                    {item?.badge && (
                      <span className="px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                        {item?.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="default"
                  fullWidth
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => handleNavigation('/create-edit-invoice')}
                >
                  New Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-[1200]"
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;