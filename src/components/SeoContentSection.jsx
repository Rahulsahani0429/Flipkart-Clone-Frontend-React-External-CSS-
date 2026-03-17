import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const categoryLinks = [
  {
    label: 'MOST SEARCHED FOR ON FLIPKART',
    links: ['Motorola Edge 70 Fusion', 'Google Pixel 10a', 'Big Saving Days Sale', 'Ed Hardy Shoes', 'OPPO K9x 5G', 'Lumio Projectors', '50 Mobiles', 'Motorola Logo', 'Signature Bags for Men', 'Laptop Store', 'Mixer Juicer Grinder', "Men's Shoes", "Adidas Men's Shoes", 'Boat Earbuds', 'Body Lotion', 'Campus Shoes', 'Earphones', 'Red Tape Shoes', "Men's Slippers", 'Hamals', 'Nike Shoes', 'Puma Shoes', 'Trimmers', 'Lumic Arc', 'Lumic Arc 2', 'Vivo Phones', 'Koo Phones', 'SmartWatches', 'Biscuits', "Women's Footwear", 'Trolley Bags', 'Water Bottles', "Men's Jackets", "American Suits", "Women's Watches", "Men's Winter Jackets", 'Teddy Bears', 'Premium Laptops', 'Ray Ban', 'Smart Smart Glasses', 'Ring', 'Earrings', 'Jeans', 'Airpods', 'Upm Power Bank', '6dBuart Wireless Earphones', 'Bose Soundbars', 'Jewellery']
  },
  {
    label: 'MOBILES',
    links: ['4G Mobiles', 'Nokia Phones', 'Samsung Mobiles', 'Oppo Mobiles', 'Apple Phones', 'Realme Mobiles', 'Nothing Phone', 'OnePlus Mobiles', 'Blackberry Phones', 'POCO Mobiles', 'Feature Mobile Phones', 'Redmi Phones', 'Motorola Mobiles', 'Mobile Phones Under 10000', 'Mobile Phones Under 15000', 'Mobile Phones Under 20000', 'Mobile Phones Under 25000 (256 GB Mobiles)', '512 GB Mobiles', '5.5 Inch Mobiles']
  },
  {
    label: 'CAMERA',
    links: ['Akaso Action Camera', 'Nikon Camera', 'Canon Cameras', 'Sony Cameras', 'Instant Cameras', 'DSLR Mirrorless Cameras', 'GoPro Cameras', 'Insta360 Cameras', 'Drones', 'Sports Action Cameras']
  },
  {
    label: 'LAPTOPS',
    links: ['Apple Laptops', 'Acer Laptops', 'Lenovo Laptops', 'Gaming Laptops', 'Dell Laptops', 'Asus Laptops', 'HP Laptops', 'Samsung Laptops', 'Laptops Under 30000', 'Laptops Under 40000', 'Laptops Under 60000', 'i5 Laptops', 'i7 Laptops']
  },
  {
    label: 'TVs',
    links: ['LG TV', 'Sony TV', 'Samsung TV', '4K TVs', 'LED TV', 'Smart TV', 'QLED TV', 'Android TVs', '4K TV', '8K TV', 'TV Under 15000', 'TV Under 20000', 'Best TV Brands']
  },
  {
    label: 'LARGE APPLIANCES',
    links: ['Air Conditioners', 'Refrigerators', '4 Star ACs', 'Microwave Ovens', 'Air Fryers', 'Refrigerators', 'Washing Machines', 'Water Purifiers', 'Induction Stove', 'Water Geysers', 'Room Heaters', '1.5 Ton ACs', 'Dish Washers', 'Electric Cookers']
  },
  {
    label: 'CLOTHING',
    links: ['Sarees', 'Lehengas', 'Kurtas/Kurtis', 'Ethnic Suits', "Women's Tips", "Women's Night Suits", "Women's Shirts", "Women's Jeans", "Women's Ghagra", "Women's Trousers", "Women's Sweatshirts", "Women's Hoodies", "Women's Jackets", 'Casual Shirts', "Men's Shirts", "Men's T-shirts", "Men's Jeans", "Men's Trousers", "Men's Track pants", 'Blazers', "Men's Sweatshirts", "Men's Sweaters"]
  },
  {
    label: 'FOOTWEAR',
    links: ['Footwear', 'Kids Footwear', "Men's Formal Shoes", "Men's Casual Shoes", "Men's Sneakers", "Men's Sports Shoes", "Women's Sandals", "Women's Slippers & Hip Flops", 'Heels', "Women's Sneakers", "Women's Sports Shoes", 'Boys Shoes', 'Girls Shoes', 'Skechers Shoes', 'Crocs']
  },
  {
    label: 'GROCERIES',
    links: ['Staples', 'Snacks & Beverages', 'Packaged Foods', 'Personal & Baby Care', 'Medicines & Spices', 'Oils & Fats', 'Pulses', 'Dry Fruits', 'Nuts & Seeds', 'Chips & Namkeens', 'Cookies & Biscuits', 'Pickles & Paste', 'Soft Drinks', 'Chocolates & Sweets', 'Appetizers & Fresheners', 'Laundry Detergents']
  },
  {
    label: 'BEST SELLING ON FLIPKART',
    links: ['Chocolate Horlicks', 'Minimalist Face Cleanser', 'Garnier Vitamin C Face Serum', 'Motorola LED Smart Google TV', 'Simple Face Wash (Pack of 2)', 'Mamaearth Anti Hair Fall Shampoo', 'Whirlpool Semi Automatic Top Load Washing Machine (7.5Kg, Black Grey)', 'Campus Running Shoes', 'LG Convection Microwave Oven', 'Usha Big Blaster Paddlock Anti-Burglar Heavy Duty Door Lock', 'Peter England Flat Track Pants', 'Punam Running Shoes', 'Yoga Mat For Gym Quality Exercises', 'Mi Guard 400 0.5 ton AC', 'Boat Bluetooth Audio Amp 100', 'Realme C71 (128GB,Obsidian Black)', 'OnePlus Nordibuds Open Face Sense (Pack of 2)', 'Boat Face Sense', 'Apple iPhone 16 Plus (128GB,Natural Titanium)', 'Nothing Phone 1e (128GB,Natura Titanium)', 'Google Pixel 10 (256GB,Frost)', 'Apple iPhone 15 (128GB,White)', 'Motorola Edge 60 Fusion 5G (256GB,Pantone Amaranth)', 'Poco X7 Pro 5G (256GB,Obsidian Black)', 'Samsung Galaxy S24 Ultra 5G (256GB,Titanium Black)', 'Vivo T4x 5G (128GB,Marine Blue)', 'Apple iPhone 17 Pro (256GB,Cosmic Orange)', 'Oppo Neo 10R 5G (128GB,Raging Blue)', 'Oppo F31 Pro 5G (128GB,Space Grey)', 'Oppo Reno 14 Pro 5G (256GB,Titanium Silver)', 'Samsung Galaxy S25 Ultra 5G (256GB,Titanium Silverblue)', 'Vivo V50 5G (256GB,Auspicious Gold)', 'Infinix Note 025 5G (128GB,Titanium Dive)', 'OnePlus 19 5G (256GB,Sandstorm)']
  },
  {
    label: 'FURNITURE',
    links: ['Furniture Store', 'Beds', 'Dining Table Sets', 'Wardrobes', 'TV Units & Cabinets', 'Office & Study Chairs', 'Office & Study Tables', 'Sofa Sets', 'Mattress', 'Sofa Beds', 'Shoe Racks', 'Dressing Tables', 'Home Temples', 'Kitchen Cabinets', 'King Size Beds', 'Queen Size Beds']
  },
  {
    label: 'BGMF',
    links: ['Toys Online Store', 'Fans & Stationery', 'Beauty And Grooming', 'Makeup Kits', 'Body, Face & Skin Care', 'Perfumes', 'Books Online Store', 'Automotive Accessories', 'Car Accessories', 'Bike Accessories', 'Food Products', 'Health Care', 'Health Supplements', 'Sports Equipment', 'Exercise & Fitness Accessories', 'Baby Care', 'HouseHold Supplies', 'Home Decor', 'Home Improvement Tools', 'Kitchen Cookware & Serveware', 'Wallpapers', 'Home Furnishings', 'Wall Decor', 'Tableware & Dinnerware', 'Glassware Sets', 'Bed Linen & Blankets', 'Cushions & Pillows', 'Curtains', 'Festive Decor & Gifting']
  }
];

const SeoContentSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="seo-outer-wrap">
      <div className="seo-inner">

        {/* Category Directory */}
        <div className="seo-category-dir">
          <p className="seo-dir-title">Top Stories: Brand Directory</p>
          {categoryLinks.map((cat, i) => (
            <div key={i} className="seo-cat-row">
              <span className="seo-cat-label">{cat.label}: </span>
              {cat.links.map((link, j) => (
                <span key={j}>
                  <Link to={`/shop?search=${encodeURIComponent(link)}`} className="seo-cat-link">{link}</Link>
                  {j < cat.links.length - 1 && <span className="seo-sep"> | </span>}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* SEO Description Blocks */}
        <div className={`seo-desc-wrap ${isExpanded ? 'expanded' : 'collapsed'}`}>
          <div className="seo-desc-inner">
            <h2 className="seo-main-title">Flipkart: India's Ultimate Online Shopping Destination</h2>
            <p>India's trusted and beloved e-commerce platform, revolutionizing online shopping since 2007. With over 200 million users, 750 million+ products across 80+ categories, and a relentless focus on customer satisfaction, Flipkart isn't just an online store; it's your digital shopping companion. Be it the Flipkart app or the comprehensive Flipkart website, discover an unmatched universe of products, incredible Flipkart sale events, and seamless service. From the latest gadgets to daily groceries, fashion must-haves to furniture solutions, Flipkart is your definitive destination for e-commerce in India, offering convenience, value, and reliability at every click. Experience the joy of buying online with India's homegrown leader!</p>

            <h3 className="seo-block-title">What Can You Buy from Flipkart?</h3>
            <p>Flipkart's strength lies in its incredible diversity. With offerings for every need, aspiration, and budget, you can dive into the meticulously curated categories for your needs:</p>

            <h3 className="seo-block-title">Mobile and Electronics:</h3>
            <p>Stay connected with the world using Flipkart's advanced features and the latest technology. As a leading e-commerce platform, we offer all the latest models from top brands. Explore the newest flagships from Samsung, Apple, OnePlus, Xiaomi, Vivo, Oppo, and more. Find budget-friendly smartphones, 5G powerhouses, gaming phones, and refurbished options. Additionally, Flipkart Complete Mobile Protection offers comprehensive coverage for post-purchase issues, including door-to-door services. Complement your device with extensive accessories, including durable back covers, screen protectors, fast chargers, power banks, wireless earbuds, smartwatches, fitness bands, and VR headsets.</p>

            <h3 className="seo-block-title">Flipkart Fashion: Dress Your Style Naturally</h3>
            <p>Stay ahead in style with Flipkart's vast fashion selection! Whether you're looking for trendy western wear or traditional ethnic attire, our store has it all. Browse through a curated collection of men's and women's clothing, footwear, and accessories from top brands. From party wear to everyday casuals, find the perfect outfit for every occasion. Take advantage of our regular fashion sales to grab your favorite picks at the best prices.</p>

            <h3 className="seo-block-title">Planned Movies, Electronics and Gadgets: Treats to Your Soul Section</h3>
            <p>Immerse yourself in the world of entertainment with Flipkart's extensive range of consumer electronics. From cutting-edge televisions from brands like Sony, Samsung, and LG to immersive audio systems, gaming consoles, and smart home devices, our selection caters to every type of tech enthusiast. Explore the latest innovations in smart TV technology, high-performance laptops, and much more, all at competitive prices.</p>

            <h3 className="seo-block-title">Choose Books and Discover Endless Pages of Joy</h3>
            <p>Books transcend time and Flipkart recognizes this. Our comprehensive book section spans across genres and authors, making it a paradise for book lovers. Whether you're an avid reader or looking for the perfect gift, Flipkart's book section ensures you're never short of options. Find the latest bestsellers, timeless classics, academic textbooks, competitive exam preparation guides, and children's books, all available for quick delivery to your doorstep.</p>

            <h3 className="seo-block-title">Why Choose Our Online Shopping Marketplace?</h3>

            <ul className="seo-benefits-list">
              <li><strong>Vast Product Range:</strong> Millions of products across 80+ categories for every need and budget.</li>
              <li><strong>100% Secure Payments:</strong> Multiple payment options including cards, UPI, wallets, and EMI with bank-level security.</li>
              <li><strong>Easy Returns & Refunds:</strong> Hassle-free return policy with quick refund processing within 5–7 business days.</li>
              <li><strong>Fast Delivery:</strong> Same-day and next-day delivery options available with real-time shipment tracking.</li>
              <li><strong>24/7 Customer Support:</strong> Dedicated support via chat, email, and phone for a smooth shopping experience.</li>
              <li><strong>Exclusive Sale Events:</strong> Access to Big Billion Days, End of Season Sales, and daily deals with massive discounts.</li>
              <li><strong>Flipkart Plus Benefits:</strong> Loyalty rewards, early sale access, and free delivery for Flipkart Plus members.</li>
              <li><strong>Authentic Products:</strong> Guaranteed genuine products from authorized sellers backed by brand warranties.</li>
            </ul>

            <h3 className="seo-block-title">Get Exciting Offers and Redeem Super Coin Points</h3>
            <p>Unlock a world of benefits through our exclusive loyalty program. Earn reward points with every purchase, and redeem them for attractive discounts on future purchases. Take advantage of our seasonal sales, flash deals, and exclusive offers available through the app. With EMI options, easy financing, and regular cashback deals from partnering banks, shopping with us is more affordable than ever.</p>
          </div>
          {!isExpanded && <div className="seo-fade-overlay" />}
        </div>

        <button className="seo-read-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '▲ Read Less' : '▼ Read More'}
        </button>
      </div>

      <style>{`
        .seo-outer-wrap {
          background: #fff;
          border-top: 1px solid #e8e8e8;
          padding: 24px 0 32px;
          width: 100%;
          box-sizing: border-box;
        }
        .seo-inner {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0 1rem;
          text-align: left;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .seo-inner { padding: 0 2rem; }
        }
        .seo-dir-title {
          font-size: 13px;
          font-weight: 700;
          color: #282c3f;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .seo-cat-row {
          font-size: 12.5px;
          color: #696e79;
          line-height: 1.9;
          margin-bottom: 2px;
          word-break: break-word;
        }
        .seo-cat-label {
          font-weight: 700;
          color: #282c3f;
          margin-right: 3px;
        }
        .seo-cat-link {
          color: #696e79;
          text-decoration: none;
          transition: color 0.15s;
        }
        .seo-cat-link:hover {
          color: #2874f0;
          text-decoration: underline;
        }
        .seo-sep {
          color: #c2c2c2;
          margin: 0 2px;
        }
        .seo-desc-wrap {
          position: relative;
          margin-top: 22px;
          overflow: hidden;
          transition: max-height 0.45s ease;
        }
        .seo-desc-wrap.collapsed { max-height: 210px; }
        .seo-desc-wrap.expanded { max-height: 3000px; }
        .seo-fade-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 70px;
          background: linear-gradient(transparent, #fff);
          pointer-events: none;
        }
        .seo-desc-inner {
          padding-bottom: 8px;
        }
        .seo-main-title {
          font-size: 15px;
          font-weight: 700;
          color: #282c3f;
          margin: 0 0 10px 0;
        }
        .seo-desc-inner > p {
          font-size: 13px;
          color: #696e79;
          line-height: 1.65;
          margin: 0 0 12px 0;
        }
        .seo-block-title {
          font-size: 13px;
          font-weight: 700;
          color: #282c3f;
          margin: 14px 0 5px 0;
        }
        .seo-benefits-list {
          margin: 6px 0 12px 18px;
          padding: 0;
        }
        .seo-benefits-list li {
          font-size: 13px;
          color: #696e79;
          line-height: 1.8;
          list-style-type: disc;
        }
        .seo-benefits-list li strong {
          color: #282c3f;
        }
        .seo-read-more-btn {
          display: block;
          background: none;
          border: none;
          color: #2874f0;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 10px 0 0;
          letter-spacing: 0.2px;
          text-align: left;
        }
        .seo-read-more-btn:hover { text-decoration: underline; }
        @media (max-width: 600px) {
          .seo-cat-row { font-size: 11.5px; line-height: 1.7; }
        }
      `}</style>
    </div>
  );
};

export default SeoContentSection;
