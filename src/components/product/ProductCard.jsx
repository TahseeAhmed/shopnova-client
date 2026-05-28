import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { addToCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
  const img = product.images?.[0]?.url || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    dispatch(addToCart({ ...product, _id: product._id }));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-img">
        <img src={img} alt={product.name} loading="lazy" />
        {discount && <span className="p-badge sale">-{discount}%</span>}
        {product.stock === 0 && <span className="p-badge out">Out of Stock</span>}
        <button className="wishlist-btn" onClick={(e) => { e.preventDefault(); toast.success('Added to wishlist!'); }}>
          <FiHeart />
        </button>
      </div>
      <div className="product-card-body">
        <div className="product-cat">{product.category?.name}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <FiStar fill="#f5c842" stroke="#f5c842" size={13} />
          <span className="rating-num">{product.ratings?.toFixed(1)}</span>
          <span className="rating-count">({product.numReviews?.toLocaleString()})</span>
        </div>
        <div className="product-footer">
          <div className="product-price">
            <span className="price-current">${product.price}</span>
            {product.originalPrice && <span className="price-old">${product.originalPrice}</span>}
          </div>
          <button className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`} onClick={handleAddToCart}>
            <FiShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
