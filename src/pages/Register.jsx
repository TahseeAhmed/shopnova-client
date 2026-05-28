import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    dispatch(register({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">Shop<span>Nova</span></Link>
          <h2>Create Account</h2>
          <p>Join thousands of happy shoppers today</p>
        </div>

        <div className="social-btns">
          <button className="social-btn" type="button">
            <img src="https://www.google.com/favicon.ico" alt="Google" width="16"/>
            Sign up with Google
          </button>
          <button className="social-btn" type="button">
            <span>🍎</span> Sign up with Apple
          </button>
        </div>

        <div className="auth-divider"><span>or sign up with email</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrap">
              <FiUser className="input-icon"/>
              <input name="name" type="text" className="form-input with-icon" placeholder="Ahmad Ali" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon"/>
              <input name="email" type="email" className="form-input with-icon" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon"/>
                <input name="password" type={showPass ? 'text' : 'password'} className="form-input with-icon with-icon-right" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon"/>
                <input name="confirmPassword" type="password" className="form-input with-icon" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="terms-note">
            By creating an account, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner"/> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <div className="auth-side">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" alt="Shopping"/>
        <div className="auth-side-overlay">
          <div className="auth-perks">
            <div className="perk-item"><span>✓</span> Free shipping on orders over $100</div>
            <div className="perk-item"><span>✓</span> Exclusive member discounts</div>
            <div className="perk-item"><span>✓</span> Order tracking & history</div>
            <div className="perk-item"><span>✓</span> 24/7 customer support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
