import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SocketProvider } from './context/SocketContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import ProductList from './pages/ProductList'
import ProductEdit from './pages/ProductEdit'
import UserList from './pages/UserList'
import AdminCustomers from './pages/AdminCustomers'
import AdminReports from './pages/AdminReports'
import AdminStats from './pages/AdminStats'
import AdminNotifications from './pages/AdminNotifications'
import AdminHelp from './pages/AdminHelp'
import AdminSettings from './pages/AdminSettings'
import OrderList from './pages/OrderList'
import PaymentList from './pages/PaymentList'
import MyOrders from './pages/MyOrders'
import Shipping from './pages/Shipping'
import Payment from './pages/Payment'
import PlaceOrder from './pages/PlaceOrder'
import Success from './pages/Success'
import TrackShipment from "./pages/TrackShipment";
import OrderDetails from './pages/OrderDetails'
import AdminOrderDetail from './pages/AdminOrderDetail'
import AdminCustomerProfile from './pages/AdminCustomerProfile'
import InfoPage from './pages/InfoPage'

import UserLayout from './components/UserLayout'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <Router>
            <ScrollToTop />
            <ToastContainer position="top-right" autoClose={3000} />
            <AppContent />
          </Router>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  )
}

function AppContent() {
  return (
    <Routes>
      {/* User Interface routes wrapped in UserLayout */}
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/category/:categoryName" element={<Shop />} />
        <Route path="/shop/brand/:brandName" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/orders" element={<MyOrders />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/success/:id" element={<Success />} />
        <Route path="/track-shipment/:id" element={<TrackShipment />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/info/:slug" element={<InfoPage />} />
        
        {/* Helper aliases for common paths if needed directly */}
        <Route path="/about" element={<InfoPage />} />
        <Route path="/contact" element={<InfoPage />} />
      </Route>

      {/* Admin Panel routes wrapped in ProtectedRoute */}
      <Route element={<ProtectedRoute isAdmin={true} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/product/:id/edit" element={<ProductEdit />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/help" element={<AdminHelp />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/orders" element={<OrderList />} />
        <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
        <Route path="/admin/customers/:customerId" element={<AdminCustomerProfile />} />
        <Route path="/admin/payments" element={<PaymentList />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<UserLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App

