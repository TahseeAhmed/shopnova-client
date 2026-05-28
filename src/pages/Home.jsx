import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import './Home.css';

const HERO_SLIDES = [
  { label: 'New Arrivals', title: 'Discover Products', em: " You'll Love", sub: 'Premium quality goods curated for modern living. Electronics, fashion, home — all in one beautiful store.', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', cta: 'Shop Now' },
];

const BANNERS = [
  { title: 'Electronics', sub: 'Up to 40% off', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', slug: 'electronics', color: '#0a0e1a' },
  { title: 'Fashion', sub: 'New Season Styles', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', slug: 'fashion', color: '#1a0a2e' },
  { title: 'Home & Living', sub: 'Refresh Your Space', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', slug: 'home-living', color: '#0a1a0e' },
];

const Home = () => {
  const dispatch = useDispatch();
  const { featured, categories, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">✨ Free shipping on orders over $100</span>
          <h1>Discover Products<br/><em>You'll Love</em></h1>
          <p>Premium quality goods curated for modern living. Electronics, fashion, home — all in one beautiful store.</p>
          <div className="hero-btns">
            <Link to="/shop" className="btn btn-primary btn-lg">Shop Now →</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Join Free</Link>
          </div>
          <div className="hero-stats">
            <div><strong>50K+</strong><span>Products</span></div>
            <div><strong>200K+</strong><span>Customers</span></div>
            <div><strong>4.9★</strong><span>Rating</span></div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=700&q=80" alt="Shop" />
          <div className="hero-float-card">
            <span>🎧</span>
            <div><strong>Sony WH-1000XM5</strong><small>$299 — In Stock</small></div>
          </div>
        </div>
      </section>

      {/* CATEGORY BANNERS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/shop" className="see-all">See all →</Link>
          </div>
          <div className="category-banners">
            {BANNERS.map((b) => (
              <Link to={`/shop?category=${b.slug}`} key={b.slug} className="cat-banner" style={{ background: b.color }}>
                <div className="cat-banner-text">
                  <h3>{b.title}</h3>
                  <p>{b.sub}</p>
                  <span>Shop →</span>
                </div>
                <img src={b.img} alt={b.title} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-sub">Handpicked just for you</p>
            </div>
            <Link to="/shop" className="see-all">View all →</Link>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* PROMO STRIP */}
      <section className="promo-strip">
        <div className="container">
          <div className="promo-cards">
            <div className="promo-card"><span>🚚</span><div><strong>Free Shipping</strong><p>On orders over $100</p></div></div>
            <div className="promo-card"><span>🔄</span><div><strong>Easy Returns</strong><p>30-day return policy</p></div></div>
            <div className="promo-card"><span>🔒</span><div><strong>Secure Payment</strong><p>100% secured checkout</p></div></div>
            <div className="promo-card"><span>🎧</span><div><strong>24/7 Support</strong><p>Always here for you</p></div></div>
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="promo-banner">
            <div>
              <span className="promo-tag-label">LIMITED OFFER</span>
              <h2>Get 20% Off Your First Order!</h2>
              <p>Use code <strong>NOVA20</strong> at checkout. Valid for new customers only.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Claim Discount →</Link>
            </div>
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80" alt="Promo" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
