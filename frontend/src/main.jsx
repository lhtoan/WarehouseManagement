import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login/Login';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Product from './pages/Product/Product';
import ProductAddForm from './pages/Product/ProductAddForm';
import Warehouse from './pages/Warehouse/Warehouse';
import Order from './pages/Order/Order';
import Invoice from './pages/Invoice/Invoice';
import UserSearch from './pages/Invoice/UserSearch';
import ProtectedRoute from './ProtectedRoute'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          {/* Layout chung nếu cần sidebar */}
          <Route path="/" element={<Layout />}>
            <Route path="home" element={<Home />} />
            <Route path="products" element={<Product />} />
            <Route path="products/add" element={<ProductAddForm />} />
            <Route path="warehouse" element={<Warehouse />} />
            <Route path="order" element={<Order />} />
            <Route path="invoices" element={<Invoice />} />
          </Route>
          {/* Route bên ngoài layout nhưng vẫn bảo vệ */}
          
        </Route>
        <Route path="don-hang/tra-cuu" element={<UserSearch />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);