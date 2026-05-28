import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPackage } from 'react-icons/fi';
import './Orders.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATUS_COLORS = { pending:'#fef3c7', processing:'#dbeafe', shipped:'#e0e7ff', delivered:'#d1fae5', cancelled:'#fee2e2' };
const STATUS_TEXT   = { pending:'#92400e', processing:'#1e40af', shipped:'#3730a3', delivered:'#065f46', cancelled:'#991b1b' };

const Orders = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOrders(r.data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="page-hero" style={{ borderRadius: 'var(--radiusl)', marginBottom: '2rem' }}>
          <div style={{ padding: '2.5rem' }}>
            <h1 style={{ color: 'var(--white)', marginBottom: 4 }}>My Orders</h1>
            <p style={{ color: '#9ca3af' }}>{orders.length} orders placed</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FiPackage size={60}/></div>
            <h3>No orders yet</h3>
            <p>Once you place an order, it will appear here.</p>
            <Link to="/shop" className="btn btn-dark">Start Shopping →</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-head">
                  <div>
                    <span className="order-card-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-card-date">{new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <span className="order-status-badge" style={{ background: STATUS_COLORS[order.status], color: STATUS_TEXT[order.status] }}>
                      {order.status}
                    </span>
                    <strong>${order.totalPrice?.toFixed(2)}</strong>
                  </div>
                </div>
                <div className="order-card-items">
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} alt={item.name}/>
                      <div className="order-item-info">
                        <span>{item.name}</span>
                        <small>Qty: {item.quantity} × ${item.price}</small>
                      </div>
                      <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="order-card-foot">
                  <div className="order-foot-info">
                    <span>{order.isPaid ? '✅ Paid' : '❌ Payment Pending'}</span>
                    <span>{order.isDelivered ? '✅ Delivered' : '🚚 Not yet delivered'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
