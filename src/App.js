import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { loadUser } from './store/slices/authSlice';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';

import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';

import './styles/global.css';
import './pages/admin/Admin.css';
import './pages/admin/AdminTable.css';
import './pages/admin/AdminCategories.css';

const AppInner = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) store.dispatch(loadUser());
  }, []);

  return (
    <Router>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#0a0e1a', color: '#fff', borderRadius: '10px', fontSize: '0.875rem' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
        }}
      />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products"   element={<AdminProducts />} />
          <Route path="orders"     element={<AdminOrders />} />
          <Route path="customers"  element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/shop"        element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart"        element={<Cart />} />
              <Route path="/orders"      element={<Orders />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
    </Router>
  );
};

const App = () => (
  <Provider store={store}>
    <AppInner />
  </Provider>
);

export default App;
