import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiEye, FiChevronDown } from 'react-icons/fi';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const STATUS_COLORS = { pending:'#fef3c7', processing:'#dbeafe', shipped:'#e0e7ff', delivered:'#d1fae5', cancelled:'#fee2e2' };
const STATUS_TEXT   = { pending:'#92400e', processing:'#1e40af', shipped:'#3730a3', delivered:'#065f46', cancelled:'#991b1b' };

const AdminOrders = () => {
  const { token } = useSelector((s) => s.auth);
  const headers = { Authorization: `Bearer ${token}` };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const r = await axios.get(`${API}/orders${params}`, { headers });
      setOrders(r.data.orders || []);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status`, { status }, { headers });
      toast.success('Status updated');
      load();
      if (selectedOrder?._id === id) setSelectedOrder((o) => ({ ...o, status }));
    } catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div className="admin-page-title">
        <h1>Orders</h1>
        <p>{orders.length} orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="order-filter-tabs">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} className={`filter-tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ marginTop: '1rem' }}>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-row">No orders found</div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><span className="order-id">#{o._id.slice(-8).toUpperCase()}</span></td>
                  <td>
                    <div><strong style={{fontSize:'0.875rem'}}>{o.user?.name}</strong></div>
                    <small style={{color:'var(--textl)'}}>{o.user?.email}</small>
                  </td>
                  <td style={{fontSize:'0.82rem',color:'var(--textl)'}}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td><strong>${o.totalPrice?.toFixed(2)}</strong></td>
                  <td>
                    <span className="order-status-badge" style={{background:STATUS_COLORS[o.status],color:STATUS_TEXT[o.status]}}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <div className="select-wrap" style={{minWidth:'130px'}}>
                      <select className="form-input" style={{padding:'6px 28px 6px 10px',fontSize:'0.8rem'}} value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                        {['pending','processing','shipped','delivered','cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <FiChevronDown size={12}/>
                    </div>
                  </td>
                  <td>
                    <button className="td-btn edit" onClick={() => setSelectedOrder(o)}><FiEye size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div style={{padding:'1.5rem',maxHeight:'60vh',overflowY:'auto'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1.25rem'}}>
                <div><div className="form-label">Customer</div><strong>{selectedOrder.user?.name}</strong><br/><small>{selectedOrder.user?.email}</small></div>
                <div><div className="form-label">Status</div>
                  <span className="order-status-badge" style={{background:STATUS_COLORS[selectedOrder.status],color:STATUS_TEXT[selectedOrder.status]}}>{selectedOrder.status}</span>
                </div>
                <div><div className="form-label">Date</div><span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span></div>
                <div><div className="form-label">Payment</div><span>{selectedOrder.isPaid ? '✅ Paid' : '❌ Unpaid'}</span></div>
              </div>
              {selectedOrder.shippingAddress && (
                <div style={{background:'var(--cream)',borderRadius:'8px',padding:'12px',marginBottom:'1.25rem'}}>
                  <div className="form-label">Shipping Address</div>
                  <p style={{fontSize:'0.875rem'}}>{selectedOrder.shippingAddress.fullName}, {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p>
                </div>
              )}
              <div className="form-label" style={{marginBottom:'8px'}}>Items</div>
              {selectedOrder.orderItems?.map((item, i) => (
                <div key={i} style={{display:'flex',gap:'12px',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f0e8d8'}}>
                  <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50'} alt={item.name} style={{width:44,height:44,objectFit:'cover',borderRadius:8}}/>
                  <div style={{flex:1}}><strong style={{fontSize:'0.875rem'}}>{item.name}</strong><div style={{fontSize:'0.78rem',color:'var(--textl)'}}>Qty: {item.quantity}</div></div>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
              <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'6px',fontSize:'0.875rem'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Subtotal</span><span>${selectedOrder.itemsPrice?.toFixed(2)}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Shipping</span><span>${selectedOrder.shippingPrice?.toFixed(2)}</span></div>
                <div style={{display:'flex',justifyContent:'space-between'}}><span>Tax</span><span>${selectedOrder.taxPrice?.toFixed(2)}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontWeight:800,fontSize:'1rem',paddingTop:'8px',borderTop:'1px solid #f0e8d8'}}><span>Total</span><span>${selectedOrder.totalPrice?.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
