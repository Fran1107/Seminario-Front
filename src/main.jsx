import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './index.css'
import { CartProvider } from './components/Context/CartContext.jsx';

import PrincipalProvider from './components/Context/PrincipalContext.jsx';

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <CartProvider>
      <PrincipalProvider>
        <App />
      </PrincipalProvider>
    </CartProvider>
  </StrictMode>
);
