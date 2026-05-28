import React, { useEffect, useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  FiGrid, FiPackage, FiShoppingCart, FiUsers, FiTag,
  FiSettings, FiLogOut, FiMenu, FiX, FiTrendingUp,
  FiDollarSign, FiAlertCircle, FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NAV_ITEMS = [
  { label: 'Overview',   path: '/admin',           icon: <FiGrid/> },
  { label: 'Products',   path: '/admin/products',  icon: <FiPackage/> },
  { label: 'Orders',     path: '/admin/orders',    icon: <FiShoppingCart/> },
  { label: 'Customers',  path: '/admin/customers', icon: <FiUsers/> },
  { label: 'Categories', path: '/admin/categories',icon: <FiTag/> },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); toast.error('Admin access only'); }
  }, [user, navigate]);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${API}/orders/stats`, { headers }).then((r) => setStats(r.data)).catch(() => {});
    axios.get(`${API}/orders?limit=5`, { headers }).then((r) => setRecentOrders(r.data.orders || [])).catch(() => {});
  }, [token]);

  const isOverview = location.pathname === '/admin';

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link to="/" className="admin-logo">Shop<span>Nova</span></Link>
          <button className="sidebar-x" onClick={() => setSidebarOpen(false)}><FiX/></button>
        </div>
        <div className="admin-user-card">
          <div className="admin-avatar">{user?.name?.[0]}</div>
          <div><strong>{user?.name}</strong><small>Administrator</small></div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-label">Menu</div>
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              {item.icon} {item.label}
            </Link>
          ))}
          <div className="admin-nav-label" style={{marginTop:'1.5rem'}}>System</div>
          <Link to="/" className="admin-nav-link"><FiSettings/> View Store</Link>
          <button className="admin-nav-link logout-btn" onClick={() => navigate('/')}><FiLogOut/> Back to Site</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}><FiMenu size={20}/></button>
          <div className="admin-breadcrumb">
            <span>Admin</span>
            {!isOverview && <><FiChevronRight size={14}/><span style={{color:'var(--text)',fontWeight:600}}>{NAV_ITEMS.find(n => location.pathname.startsWith(n.path) && n.path !== '/admin')?.label}</span></>}
          </div>
          <div className="admin-topbar-actions">
            <Link to="/shop" className="btn btn-outline btn-sm">Visit Store</Link>
          </div>
        </div>

        <div className="admin-content">
          {isOverview ? (
            <AdminOverview stats={stats} recentOrders={recentOrders} token={token} />
          ) : (
            <Outlet />
          )}
        </div>
      </main>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)}/>}
    </div>
  );
};

const AdminOverview = ({ stats, recentOrders, token }) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (!token) return;
    axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/products?limit=5`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setProducts(r.data.products || [])).catch(() => {});
  }, [token]);

  const statCards = [
    { label: 'Total Revenue', value: `$${(stats?.revenue || 48295).toLocaleString()}`, icon: <FiDollarSign/>, change: '+12.4%', up: true, color: '#ecfdf5', iconColor: '#10b981' },
    { label: 'Total Orders',  value: (stats?.totalOrders || 1284).toLocaleString(), icon: <FiShoppingCart/>, change: '+8.1%', up: true, color: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Customers',     value: '9,472', icon: <FiUsers/>, change: '+5.3%', up: true, color: '#faf5ff', iconColor: '#8b5cf6' },
    { label: 'Products',      value: '342',   icon: <FiPackage/>, change: '3 low stock', up: false, color: '#fff7ed', iconColor: '#f59e0b' },
  ];

  const STATUS_COLORS = { pending: '#fef3c7', processing: '#dbeafe', shipped: '#e0e7ff', delivered: '#d1fae5', cancelled: '#fee2e2' };
  const STATUS_TEXT   = { pending: '#92400e', processing: '#1e40af', shipped: '#3730a3', delivered: '#065f46', cancelled: '#991b1b' };

  return (
    <div>
      <div className="admin-page-title">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {`${new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}`}</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {statCards.map((sc) => (
          <div key={sc.label} className="stat-card">
            <div className="stat-icon-wrap" style={{background:sc.color, color:sc.iconColor}}>{sc.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{sc.label}</div>
              <div className="stat-value">{sc.value}</div>
              <div className={`stat-change ${sc.up ? 'up' : 'warn'}`}>
                {sc.up ? <FiTrendingUp size={12}/> : <FiAlertCircle size={12}/>} {sc.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-2col">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="admin-see-all">View All →</Link>
          </div>
          <div className="admin-table">
            <div className="table-head">
              <span>Order</span><span>Customer</span><span>Status</span><span>Amount</span>
            </div>
            {recentOrders.length === 0 ? (
              <div className="admin-empty-row">No orders yet</div>
            ) : recentOrders.map((o) => (
              <div key={o._id} className="table-row">
                <span className="order-id">#{o._id.slice(-6).toUpperCase()}</span>
                <span className="order-cust">{o.user?.name || 'Customer'}</span>
                <span className="order-status-badge" style={{background: STATUS_COLORS[o.status], color: STATUS_TEXT[o.status]}}>{o.status}</span>
                <span className="order-amt">${o.totalPrice?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Product Stock</h3>
            <Link to="/admin/products" className="admin-see-all">Manage →</Link>
          </div>
          <div className="admin-table">
            {products.map((p) => {
              const pct = Math.min(100, (p.stock / 100) * 100);
              const barColor = p.stock < 10 ? 'var(--red)' : p.stock < 30 ? 'var(--gold)' : 'var(--green)';
              return (
                <div key={p._id} className="stock-row">
                  <img src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60'} alt={p.name} className="stock-thumb"/>
                  <div className="stock-info">
                    <span>{p.name}</span>
                    <div className="stock-bar-wrap">
                      <div className="stock-bar"><div className="stock-fill" style={{width:`${pct}%`, background:barColor}}/></div>
                      <small>{p.stock} left</small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
