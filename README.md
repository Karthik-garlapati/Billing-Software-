# Bill Tracker Pro - Modern Billing System

A comprehensive React-based billing and point-of-sale system with modern UI, inventory management, receipt printing, and sales analytics.

## 🌐 Live Demo

**🚀 Live Application**: [https://karthik-garlapati.github.io/Billing-Software-/](https://karthik-garlapati.github.io/Billing-Software-/)

## 🚀 Features

- **Modern Billing System** - Complete point-of-sale with cart management
- **Inventory Management** - Add, edit, and organize items with search functionality
- **Receipt Printing** - Generate and print professional receipts
- **Sales Dashboard** - Analytics with daily, weekly, and monthly reports
- **Settings Management** - Customizable receipt templates and store information
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Offline Support** - Local storage with online sync capabilities
- **React 18** - Latest React version with improved performance
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS** - Modern utility-first CSS framework
- **Supabase Integration** - Cloud database and authentication ready

## 📱 Application Pages

- **Billing Page** - Main POS interface with item selection and cart
- **Dashboard** - Sales analytics and business insights  
- **Settings** - Receipt customization and store configuration
- **Client Management** - Customer database and profiles
- **Invoice Management** - Create and manage invoices
- **Reports** - Detailed sales and financial reports

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Karthik-garlapati/Billing-Software-.git
   cd Billing-Software-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```
   
3. **Start the development server**:
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Build for production**:
   ```bash
   npm run build
   # or
   yarn build
   ```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the `main` branch triggers a new deployment.

### Manual Deployment Steps:
1. Push your changes to the `main` branch
2. GitHub Actions automatically builds and deploys the application
3. Visit the live URL: https://karthik-garlapati.github.io/Billing-Software-/

### Local Build Testing:
```bash
npm run build
npm run serve
```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## � Supabase Integration

The app integrates Supabase for remote persistence (invoices, line items, company settings) with an offline-first local fallback.

1. Copy `.env.example` to `.env` and set:
  ```bash
  VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
  VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
  ```
2. Ensure the SQL migration in `supabase/migrations` has been applied to your project (upload via Supabase SQL editor).
3. Start the app. If authenticated, recent remote invoices (last 50) are merged with local sales.
4. Sales created offline are queued and auto-synced when connection/session is available.

Key files:
- `src/lib/supabase.js` – client initialization (throws if env vars missing)
- `src/services/dataRepository.js` – unified local + remote repository (load, save sale, save settings, sync queue)
- `src/contexts/AuthContext.jsx` – session + profile management (signIn / signUp helpers)

To add Auth UI quickly:
```jsx
import { useAuth } from './contexts/AuthContext';
const LoginForm = () => { const { signIn, authError } = useAuth(); /* form logic */ };
```

## �📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by React and Vite
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
