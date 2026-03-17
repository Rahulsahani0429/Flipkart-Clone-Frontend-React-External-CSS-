import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, className = "deal-card" }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Get all product images
  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  // Auto-carousel when hovering
  useEffect(() => {
    if (!isHovering || allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 800); // Faster rotation for product cards (800ms)

    return () => clearInterval(interval);
  }, [isHovering, allImages.length]);

  // Reset to first image when not hovering
  useEffect(() => {
    if (!isHovering) {
      setCurrentImageIndex(0);
    }
  }, [isHovering]);

  return (
    <Link 
      to={`/product/${product._id}`} 
      className={className}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={className.includes('shop-card') ? 'shop-card-image' : 'deal-image'}>
        <img 
          src={allImages[currentImageIndex]} 
          alt={product.name} 
          onError={(e) => {
            e.target.src = '';
          }}
        />
        
        {/* Image Indicators - Only show when hovering and multiple images */}
        {isHovering && allImages.length > 1 && (
          <div className="card-image-indicators">
            {allImages.map((_, index) => (
              <span
                key={index}
                className={`card-indicator-dot ${currentImageIndex === index ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className={className.includes('shop-card') ? 'shop-card-info' : 'deal-info'}>
        {className.includes('shop-card') ? (
          <>
            <h3 title={product.name}>{product.name}</h3>
            <div className="shop-rating">
              <span className="rating-badge">{product.rating} ★</span>
              <span className="rating-count">({product.numReviews})</span>
            </div>
            <div className="shop-price-row">
              <span className="price-main">₹{product.price}</span>
              <span className="flipkart-assured">Assured</span>
            </div>
            <p className="shop-brand">{product.brand}</p>
          </>
        ) : (
          <>
            <p className="deal-name">{product.name}</p>
            <p className="deal-price">From ₹{product.price}</p>
            <p className="deal-brand">{product.brand}</p>
          </>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
