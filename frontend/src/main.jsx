import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'font-sans text-sm',
                duration: 3500,
                style: {
                  background: '#0B0F1A',
                  color: '#F5F2EB',
                  border: '1px solid rgba(245,242,235,0.1)',
                  borderRadius: '0px',
                  padding: '12px 16px',
                },
                success: { iconTheme: { primary: '#FF4D2E', secondary: '#F5F2EB' } },
                error: { iconTheme: { primary: '#D63B1F', secondary: '#F5F2EB' } },
              }}
            />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
