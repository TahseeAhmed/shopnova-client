import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateQty, removeFromCart, setShippingAddress, clearCart } from '../store/slices/cartSlice';
import { FiTrash2, FiShoppingBag, FiChevronRight, FiTruck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Cart.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STEPS = ['Cart', 'Shipping', 'Payment', 'Done'];

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, shippingAddress } = useSelector((s) => s.cart);
  const { user, token } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({ fullName: '', street: '', city: '', state: '', zipCode: '', country: 'Pakistan', phone: '' });
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const required = ['fullName', 'street', 'city', 'zipCode', 'country', 'phone'];
    if (required.some((k) => !shipping[k])) return toast.error('Please fill all shipping fields');
    dispatch(setShippingAddress(shipping));
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!user) { toast.error('Please sign in to place an order'); return navigate('/login'); }
    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({
        product: i._id, name: i.name,
        image: i.images?.[0]?.url || '', price: i.price, quantity: i.qty,
      }));
      await axios.post(`${API}/orders`, {
        orderItems, shippingAddress: shippingAddress || shipping,
        paymentMethod: 'stripe',
        itemsPrice: subtotal, shippingPrice: shippingCost, taxPrice: tax, totalPrice: total,
      }, { headers: { Authorization: `Bearer ${token}` } });
      dispatch(clearCart());
      setStep(3);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-inner">
          <div className="empty-bag-icon"><FiShoppingBag size={64} /></div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet. Start shopping to fill it up!</p>
          <Link to="/shop" className="btn btn-dark btn-lg">Start Shopping →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Stepper */}
        <div className="cart-stepper">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="step-line"/>}
            </div>
          ))}
        </div>

        {/* STEP 0 — CART */}
        {step === 0 && (
          <div className="cart-layout">
            <div className="cart-items-col">
              <div className="cart-header-row">
                <h2>Shopping Cart</h2>
                <span>{items.reduce((s, i) => s + i.qty, 0)} items</span>
              </div>
              {items.map((item) => (
                <div key={item._id} className="cart-item">
                  <img src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <Link to={`/product/${item._id}`} className="cart-item-name">{item.name}</Link>
                    <div className="cart-item-cat">{item.category?.name}</div>
                    <div className="cart-item-price-mobile">${item.price}</div>
                    <div className="cart-qty-control">
                      <button onClick={() => dispatch(updateQty({ id: item._id, qty: item.qty - 1 }))}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => dispatch(updateQty({ id: item._id, qty: item.qty + 1 }))}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-item-total">${(item.price * item.qty).toFixed(2)}</span>
                    <span className="cart-item-unit">${item.price} each</span>
                    <button className="cart-remove-btn" onClick={() => { dispatch(removeFromCart(item._id)); toast.success('Removed from cart'); }}>
                      <FiTrash2 size={15}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary-col">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="summary-rows">
                  <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Shipping</span><span>{shippingCost === 0 ? <strong style={{color:'var(--green)'}}>FREE</strong> : `$${shippingCost.toFixed(2)}`}</span></div>
                  <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                  {shippingCost > 0 && (
                    <div className="free-ship-notice">
                      <FiTruck size={13}/> Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                    </div>
                  )}
                </div>
                <div className="summary-total">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
                <div className="promo-row">
                  <input className="form-input" placeholder="Promo code (NOVA20)" style={{flex:1}} />
                  <button className="btn btn-dark btn-sm">Apply</button>
                </div>
                <button className="checkout-proceed-btn" onClick={() => { if (!user) { toast.error('Please sign in first'); navigate('/login'); } else setStep(1); }}>
                  Proceed to Checkout <FiChevronRight size={18}/>
                </button>
                <div className="secure-badges">
                  <span>🔒 SSL Secured</span>
                  <span>💳 Safe Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 — SHIPPING */}
        {step === 1 && (
          <div className="shipping-form-wrap">
            <h2>Shipping Address</h2>
            <form onSubmit={handleShippingSubmit} className="shipping-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={shipping.fullName} onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))} placeholder="Ahmad Ali" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-input" value={shipping.phone} onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))} placeholder="+92 300 1234567" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input className="form-input" value={shipping.street} onChange={(e) => setShipping((s) => ({ ...s, street: e.target.value }))} placeholder="123 Main Street, Apartment 4B" required />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className="form-input" value={shipping.city} onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))} placeholder="Karachi" required />
                </div>
                <div className="form-group">
                  <label className="form-label">State / Province</label>
                  <input className="form-input" value={shipping.state} onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))} placeholder="Sindh" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">ZIP / Postal Code *</label>
                  <input className="form-input" value={shipping.zipCode} onChange={(e) => setShipping((s) => ({ ...s, zipCode: e.target.value }))} placeholder="75500" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <select className="form-input" value={shipping.country} onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}>
                    <option>Pakistan</option><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>UAE</option>
                  </select>
                </div>
              </div>
              <div className="shipping-form-btns">
                <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>← Back to Cart</button>
                <button type="submit" className="btn btn-dark">Continue to Payment →</button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2 — PAYMENT */}
        {step === 2 && (
          <div className="shipping-form-wrap">
            <h2>Payment</h2>
            <div className="payment-card">
              <div className="payment-method-select">
                <label className="payment-option active"><input type="radio" defaultChecked /> <span>💳</span> Credit / Debit Card</label>
                <label className="payment-option"><input type="radio" /> <span>🏦</span> Bank Transfer</label>
                <label className="payment-option"><input type="radio" /> <span>📱</span> JazzCash / EasyPaisa</label>
              </div>
              <div className="card-inputs">
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input className="form-input" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input className="form-input" placeholder="MM / YY" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" placeholder="•••" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input className="form-input" placeholder="Ahmad Ali" />
                </div>
              </div>
              <div className="order-confirm-summary">
                <div className="summary-row"><span>Items ({items.reduce((s,i)=>s+i.qty,0)})</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="summary-row"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span></div>
                <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                <div className="summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
              <div className="shipping-form-btns">
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — SUCCESS */}
        {step === 3 && (
          <div className="order-success">
            <div className="success-icon">🎉</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for shopping with ShopNova. Your order is being processed and you'll receive a confirmation email shortly.</p>
            <div className="success-actions">
              <Link to="/orders" className="btn btn-dark">View My Orders</Link>
              <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
