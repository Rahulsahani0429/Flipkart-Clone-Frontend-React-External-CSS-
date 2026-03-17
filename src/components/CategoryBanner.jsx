import React, { useState, useEffect } from 'react';
import './CategoryBanner.css';

const categoryBanners = {
    fashion: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/fashion-${i + 1}/1600/420`),
    grocery: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/grocery-${i + 1}/1600/420`),
    electronics: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/electronics-${i + 1}/1600/420`),
    mobiles: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/mobiles-${i + 1}/1600/420`),
    appliances: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/appliances-${i + 1}/1600/420`),
    sports: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/sports-${i + 1}/1600/420`),
    beauty: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/beauty-${i + 1}/1600/420`),
    books: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/books-${i + 1}/1600/420`),
    "home & furniture": Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/home-furniture-${i + 1}/1600/420`),
    wearables: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/wearables-${i + 1}/1600/420`),
    travel: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/travel-${i + 1}/1600/420`),
    default: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/shop-default-${i + 1}/1600/420`)
};

const CategoryBanner = ({ category }) => {
    const activeCategory = category?.toLowerCase() || 'default';
    const banners = categoryBanners[activeCategory] || categoryBanners.default;
    const [activeIndex, setActiveIndex] = useState(0);

    // Reset index when category changes
    useEffect(() => {
        setActiveIndex(0);
    }, [activeCategory]);

    // Auto-slide logic
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length, activeCategory]);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % banners.length);
    };

    return (
        <div className="cb-container">
            <div className="cb-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {banners.map((url, idx) => (
                    <div key={`${activeCategory}-${idx}`} className="cb-slide">
                        <img src={url} alt={`${activeCategory} banner ${idx + 1}`} loading="lazy" />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button className="cb-arrow prev" onClick={handlePrev} aria-label="Previous slide">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button className="cb-arrow next" onClick={handleNext} aria-label="Next slide">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            {/* Navigation Dots */}
            <div className="cb-dots">
                {banners.map((_, idx) => (
                    <span 
                        key={idx} 
                        className={`cb-dot ${activeIndex === idx ? 'active' : ''}`}
                        onClick={() => setActiveIndex(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoryBanner;
