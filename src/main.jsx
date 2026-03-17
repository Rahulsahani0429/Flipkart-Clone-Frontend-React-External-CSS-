import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import './index.css'
import './axiosSetup.js'
import App from './App.jsx'

// NOTE: StrictMode is intentionally disabled to prevent double socket connections.
// Re-enable once socket lifecycle is managed via a Context provider with useRef.
createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ThemeProvider>
      <NotificationProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </NotificationProvider>
    </ThemeProvider>
  </AuthProvider>,
)
