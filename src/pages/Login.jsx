import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../store/slices/authSlice";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "./Auth.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password)
      return toast.error("Please fill all fields");
    dispatch(login(form));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            Shop<span>Nova</span>
          </Link>
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        <div className="social-btns">
          <button className="social-btn" type="button">
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              width="16"
            />
            Continue with Google
          </button>
          <button className="social-btn" type="button">
            <span>🍎</span> Continue with Apple
          </button>
        </div>

        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrap">
              <FiMail className="input-icon" />
              <input
                name="email"
                type="email"
                className="form-input with-icon"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <label className="form-label" style={{ margin: 0 }}>
                Password
              </label>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" />
              <input
                name="password"
                type={showPass ? "text" : "password"}
                className="form-input with-icon with-icon-right"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create one free
          </Link>
        </p>
      </div>

      <div className="auth-side">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80"
          alt="Shopping"
        />
        <div className="auth-side-overlay">
          <h3>"The best online shopping experience I've ever had!"</h3>
          <p>— Mr. MST</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
