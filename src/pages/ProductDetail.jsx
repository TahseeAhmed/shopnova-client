import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { FiShoppingCart, FiStar, FiHeart, FiShare2, FiTruck, FiRefreshCw, FiShield, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import './ProductDetail.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: product, loading } = useSelector((s) => s.products);
  const { user, token } = useSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('description');

  useEffect(() => { dispatch(fetchProduct(id)); }, [dispatch, id]);

  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (!product) return <div className="container" style={{padding:'3rem 0'}}><p>Product not found.</p></div>;

  const img = product.images?.[activeImg]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please sign in to leave a review');
    setSubmitting(true);
    try {
      await axios.post(`${API}/products/${id}/reviews`, review, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Review submitted!');
      dispatch(fetchProduct(id));
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="product-detail">
      <div className="container">
        <Link to="/shop" className="back-link"><FiChevronLeft size={16}/> Back to Shop</Link>

        <div className="detail-grid">
          {/* Images */}
          <div className="detail-images">
            <div className="main-img">
              <img src={img} alt={product.name} />
              {discount && <span className="detail-badge">-{discount}%</span>}
            </div>
            {product.images?.length > 1 && (
              <div className="img-thumbnails">
                {product.images.map((im, i) => (
                  <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={im.url} alt={`${product.name} ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-cat">{product.category?.name}</div>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating">
              <div className="stars-row">
                {[1,2,3,4,5].map((s) => <FiStar key={s} size={16} fill={s <= Math.round(product.ratings) ? '#f5c842' : 'transparent'} stroke="#f5c842"/>)}
              </div>
              <span className="detail-rating-num">{product.ratings?.toFixed(1)}</span>
              <span className="detail-reviews">({product.numReviews} reviews)</span>
            </div>

            <div className="detail-price">
              <span className="detail-price-current">${product.price}</span>
              {product.originalPrice && <span className="detail-price-old">${product.originalPrice}</span>}
              {discount && <span className="detail-save">Save ${product.originalPrice - product.price}</span>}
            </div>

            <p className="detail-desc">{product.description}</p>

            <div className="detail-meta">
              <div><span>Brand:</span> <strong>{product.brand || 'Generic'}</strong></div>
              <div><span>Availability:</span> <strong className={product.stock > 0 ? 'in-stock' : 'out-stock'}>{product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}</strong></div>
            </div>

            {product.stock > 0 && (
              <div className="qty-row">
                <span>Quantity:</span>
                <div className="qty-control">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}>
                <FiShoppingCart size={18}/> Add to Cart
              </button>
              <button className="btn btn-icon" onClick={() => toast.success('Added to wishlist!')}><FiHeart size={18}/></button>
              <button className="btn btn-icon" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><FiShare2 size={18}/></button>
            </div>

            <div className="detail-perks">
              <div><FiTruck size={15}/> Free shipping on orders over $100</div>
              <div><FiRefreshCw size={15}/> 30-day free returns</div>
              <div><FiShield size={15}/> 2-year warranty included</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="detail-tabs">
          <div className="tab-header">
            {['description', 'reviews'].map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)} {t === 'reviews' && `(${product.numReviews})`}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="tab-content">
              <p>{product.description}</p>
              {product.tags?.length > 0 && (
                <div className="tags"><strong>Tags:</strong> {product.tags.map((tg) => <span key={tg} className="tag">{tg}</span>)}</div>
              )}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="tab-content">
              {product.reviews?.length === 0 && <p className="no-reviews">No reviews yet. Be the first!</p>}
              {product.reviews?.map((r) => (
                <div key={r._id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar">{r.name[0]}</div>
                    <div>
                      <strong>{r.name}</strong>
                      <div className="stars-row sm">
                        {[1,2,3,4,5].map((s) => <FiStar key={s} size={12} fill={s <= r.rating ? '#f5c842' : 'transparent'} stroke="#f5c842"/>)}
                      </div>
                    </div>
                    <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p>{r.comment}</p>
                </div>
              ))}

              {user && (
                <form className="review-form" onSubmit={handleReview}>
                  <h4>Write a Review</h4>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select className="form-input" value={review.rating} onChange={(e) => setReview((r) => ({ ...r, rating: +e.target.value }))}>
                      {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="form-input" rows="4" placeholder="Share your experience..." value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} required />
                  </div>
                  <button type="submit" className="btn btn-dark" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
