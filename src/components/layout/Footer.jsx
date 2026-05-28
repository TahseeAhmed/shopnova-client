import React from "react";
import { Link } from "react-router-dom";
import {
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            Shop<span>Nova</span>
          </div>
          <p>
            Your premium destination for quality products. Shop with confidence,
            delivered to your door.
          </p>
          <div className="social-links">
            <a
              href="https://www.instagram.com/ahmedmahar59?utm_source=qr&igsh=MWJjaDUwaHk0MDZsbg=="
              target="_blank"
              rel="noreferrer"
            >
              <FiInstagram />
            </a>
            <a href="#t" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#f" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a
              href="https://youtube.com/@ahmedmahar8539?si=nqQRJFHo1cBpUQPO"
              target="_blank"
              rel="noreferrer"
            >
              <FiYoutube />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=electronics">Electronics</Link>
          <Link to="/shop?category=fashion">Fashion</Link>
          <Link to="/shop?category=home-living">Home & Living</Link>
          <Link to="/shop?category=beauty">Beauty</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>
            <FiMail size={14} /> atahseen541@gmail.com
          </p>
          <p>
            <FiPhone size={14} /> +92 3163583089
          </p>
          <p>
            <FiMapPin size={14} /> Sukkur, Pakistan
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ShopNova. All rights reserved.</p>
        <div className="payment-icons">
          <span>💳</span>
          <span>🏦</span>
          <span>📱</span>
          <small>Secure Payments</small>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
