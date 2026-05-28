import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut, FiSettings } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) { navigate(`/shop?keyword=${searchQuery.trim()}`); setSearchQuery(''); }
  };

  const handleLogout = () => { dispatch(logout()); navigate('/'); setUserMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">Shop<span>Nova</span></Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." />
          <button type="submit">Search</button>
        </form>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          {user?.role === 'admin' && <Link to="/admin" className="nav-link nav-admin">Admin</Link>}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn">
            <FiShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-menu-wrap">
              <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name[0].toUpperCase()}</span>}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info"><strong>{user.name}</strong><small>{user.email}</small></div>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)}><FiSettings size={14}/> Profile</Link>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)}><FiShoppingCart size={14}/> My Orders</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setUserMenuOpen(false)}><FiSettings size={14}/> Admin Panel</Link>}
                  <button onClick={handleLogout}><FiLogOut size={14}/> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-dark btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22}/> : <FiMenu size={22}/>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch}>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
          </form>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
