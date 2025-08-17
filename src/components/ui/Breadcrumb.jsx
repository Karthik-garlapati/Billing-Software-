import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/dashboard': { label: 'Dashboard', icon: 'LayoutDashboard' },
    '/invoice-list': { label: 'Invoices', icon: 'FileText' },
    '/create-edit-invoice': { label: 'Create Invoice', icon: 'Plus', parent: '/invoice-list' },
    '/client-list': { label: 'Clients', icon: 'Users' },
    '/client-profile': { label: 'Client Profile', icon: 'User', parent: '/client-list' },
    '/reports': { label: 'Reports', icon: 'BarChart3' }
  };

  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const currentPath = location?.pathname;
    const breadcrumbs = [];

    // Always start with Dashboard for non-dashboard pages
    if (currentPath !== '/dashboard' && currentPath !== '/') {
      breadcrumbs?.push({
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard'
      });
    }

    const currentRoute = routeMap?.[currentPath];
    if (currentRoute) {
      // Add parent if exists
      if (currentRoute?.parent) {
        const parentRoute = routeMap?.[currentRoute?.parent];
        if (parentRoute) {
          breadcrumbs?.push({
            label: parentRoute?.label,
            path: currentRoute?.parent,
            icon: parentRoute?.icon
          });
        }
      }

      // Add current page (not clickable)
      breadcrumbs?.push({
        label: currentRoute?.label,
        path: currentPath,
        icon: currentRoute?.icon,
        current: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard or if only one item
  if (location?.pathname === '/dashboard' || location?.pathname === '/' || breadcrumbs?.length <= 1) {
    return null;
  }

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbs?.map((item, index) => (
        <React.Fragment key={item?.path || index}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
          )}
          
          {item?.current ? (
            <div className="flex items-center space-x-1 text-foreground font-medium">
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </div>
          ) : (
            <button
              onClick={() => handleNavigation(item?.path)}
              className="flex items-center space-x-1 hover:text-foreground transition-smooth"
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;