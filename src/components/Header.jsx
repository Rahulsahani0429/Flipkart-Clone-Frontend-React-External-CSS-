import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationIcon from "./NotificationIcon";
import { API_BASE_URL } from "../config";
import Avatar from "./Avatar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?keyword=${searchTerm}`);
      setSearchTerm("");
      closeMenu();
    }
  };

  const megaMenuData = [
    {
      title: "MEN",
      categories: [
        {
          name: "Topwear",
          items: ["T-Shirts", "Casual Shirts", "Formal Shirts", "Sweatshirts", "Jackets", "Blazers & Coats", "Suits", "Rain Jackets"]
        },
        {
          name: "Bottomwear",
          items: ["Jeans", "Casual Trousers", "Formal Trousers", "Shorts", "Track Pants & Joggers"]
        },
        {
          name: "Footwear",
          items: ["Casual Shoes", "Sports Shoes", "Formal Shoes", "Sneakers", "Sandals & Floaters", "Flip Flops", "Socks"]
        },
        {
          name: "Sports & Active Wear",
          items: ["Sports Shoes", "Sports Sandals", "Active T-Shirts", "Track Pants & Shorts", "Tracksuits", "Jackets & Sweatshirts", "Sports Accessories", "Swimwear"]
        },
        {
          name: "Fashion Accessories",
          items: ["Wallets", "Belts", "Perfumes & Body Mists", "Trimmers", "Deodorants", "Ties, Cufflinks & Pocket"]
        }
      ]
    },
    {
      title: "WOMEN",
      categories: [
        {
          name: "Indian & Fusion Wear",
          items: ["Kurtas & Suits", "Kurtis", "Sarees", "Ethnic Wear", "Leggings & Salwars"]
        },
        {
          name: "Western Wear",
          items: ["Dresses", "Tops", "Tshirts", "Jeans", "Trousers & Capris", "Shorts & Skirts"]
        },
        {
          name: "Footwear",
          items: ["Flats", "Casual Shoes", "Heels", "Boots", "Sports Shoes & Floaters"]
        }
      ]
    },
    {
      title: "KIDS",
      categories: [
        {
          name: "Boys Clothing",
          items: ["T-Shirts", "Shirts", "Shorts", "Jeans", "Trousers", "Ethnic Wear"]
        },
        {
          name: "Girls Clothing",
          items: ["Dresses", "Tops", "Tshirts", "Clothing Sets", "Lehenga Choli"]
        },
        {
          name: "Toys",
          items: ["Learning & Education", "Action Figures", "Soft Toys", "Dolls", "Musical Toys"]
        }
      ]
    },
    {
      title: "HOME & LIVING",
      categories: [
        {
          name: "Bed Linen",
          items: ["Bedspreads", "Bedsheets", "Blankets", "Pillow Covers"]
        },
        {
          name: "Bath",
          items: ["Towels", "Bath Rugs", "Hand Towels", "Laundry Bags"]
        },
        {
          name: "Decor",
          items: ["Plants", "Wall Decor", "Clocks", "Vases", "Mirrors"]
        }
      ]
    },
    {
      title: "BEAUTY",
      categories: [
        {
          name: "Makeup",
          items: ["Lipstick", "Lip Gloss", "Lip Liner", "Mascara", "Eyeliner"]
        },
        {
          name: "Skincare",
          items: ["Face Wash", "Cleanser", "Face Moisturizer", "Sunscreen"]
        }
      ]
    },
    { title: "GENZ", categories: [] },
    { title: "STUDIO", isNew: true, categories: [] }
  ];

  return (
    <header className="main-header">
      <div className="container header-container">
        <div className="header-top">
          <button
            className={`mobile-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <Link to="/" className="flipkart-logo" onClick={closeMenu}>
            <span className="logo-main">Flipkart</span>
            <span className="logo-sub">
              Explore <span className="plus">Plus</span>
            </span>
          </Link>

          <div className="header-actions-mobile">
            <Link to="/cart" className="cart-mobile" onClick={closeMenu}>
              🛒 {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </div>

          <form className="search-bar desktop-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for Products, Brands and More"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </form>

          <div className="desktop-actions">
            <ul className="nav-items-list">
              {user ? (
                <li className="dropdown account-dropdown">
                  <span className="user-label">
                    <Avatar user={user} size={36} />
                    <span className="dropdown-arrow">▾</span>
                  </span>
                  <div className="dropdown-content">
                    <Link to="/profile">My Profile</Link>
                    {user.isAdmin && <Link to="/admin">Admin Dashboard</Link>}
                    <button onClick={logout}>Logout</button>
                  </div>
                </li>
              ) : (
                <li>
                  <Link to="/login" className="login-btn">
                    Login
                  </Link>
                </li>
              )}
              <li>
                <Link to="/cart" className="cart-nav">
                  🛒 Cart{" "}
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
              </li>
              <li>
                <NotificationIcon />
              </li>
              <li>
                <button className="theme-toggle" onClick={toggleTheme}>
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <form className="search-bar mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search Products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </form>

        {/* Mega Menu - Row 2 */}
        <nav className="mega-menu-nav">
          <ul className="mega-menu-list">
            {megaMenuData.map((menu, index) => {
              let catName = menu.title;
              if (["MEN", "WOMEN", "KIDS"].includes(menu.title)) catName = "Fashion";
              if (menu.title === "HOME & LIVING") catName = "Home & Furniture";
              if (menu.title === "BEAUTY") catName = "Beauty";

              const categoryLink = `/shop?category=${encodeURIComponent(catName)}${["MEN", "WOMEN", "KIDS"].includes(menu.title) ? `&subcategory=${encodeURIComponent(menu.title)}` : ""}`;

              return (
                <li key={index} className="mega-menu-item">
                  <Link to={categoryLink} className="mega-menu-link">
                    {menu.title} {menu.isNew && <span className="new-badge">NEW</span>}
                  </Link>
                  {menu.categories.length > 0 && (
                    <div className="mega-dropdown">
                      <div className="mega-dropdown-inner">
                        {menu.categories.map((cat, catIdx) => (
                          <div key={catIdx} className="mega-column">
                            <h4 className="mega-cat-title">{cat.name}</h4>
                            <ul className="mega-cat-list">
                              {cat.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link to={`/shop?category=${encodeURIComponent(catName)}&subcategory=${encodeURIComponent(item)}`} onClick={closeMenu}>
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="user-icon-bg">
            <Avatar user={user} size={45} />
          </div>
          <div className="user-info">
            {user ? (
               <div className="user-details">
                 <span className="user-greeting">Welcome,</span>
                 <span className="user-name">{user.name}</span>
               </div>
            ) : (
                <Link to="/login" className="login-prompt" onClick={closeMenu}>
                  Login & Signup
                </Link>
            )}
          </div>
          <button className="close-drawer" onClick={closeMenu}>✕</button>
        </div>
        
        <div className="drawer-content">
          <ul className="drawer-links">
            <li className="drawer-section-title">Main Menu</li>
            <li><Link to="/" onClick={closeMenu}>🏠 Home</Link></li>
            <li><Link to="/shop" onClick={closeMenu}>🛍️ All Products</Link></li>
            
            <li className="drawer-section-title">Shop by Category</li>
             {megaMenuData.map((menu, index) => {
                let catName = menu.title;
                if (["MEN", "WOMEN", "KIDS"].includes(menu.title)) catName = "Fashion";
                if (menu.title === "HOME & LIVING") catName = "Home & Furniture";
                if (menu.title === "BEAUTY") catName = "Beauty";

                const categoryLink = `/shop?category=${encodeURIComponent(catName)}${["MEN", "WOMEN", "KIDS"].includes(menu.title) ? `&subcategory=${encodeURIComponent(menu.title)}` : ""}`;
               
               return (
                 <li key={`mobile-${index}`}>
                    <Link to={categoryLink} onClick={closeMenu}>
                       • {menu.title} {menu.isNew && <span className="new-tag-sm">NEW</span>}
                    </Link>
                 </li>
               );
            })}

            <li className="drawer-section-title">My Account</li>
            {user ? (
              <>
                <li><Link to="/profile" onClick={closeMenu}>👤 My Profile</Link></li>
                {user.isAdmin && <li><Link to="/admin" onClick={closeMenu}>🛠️ Admin Panel</Link></li>}
                <li><button className="drawer-logout-btn" onClick={() => { logout(); closeMenu(); }}>🚪 Logout</button></li>
              </>
            ) : (
              <li><Link to="/login" onClick={closeMenu}>🔑 Login / Signup</Link></li>
            )}
          </ul>
          
          <div className="drawer-footer">
            <button className="mobile-theme-toggle" onClick={() => { toggleTheme(); closeMenu(); }}>
              {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`drawer-overlay ${mobileMenuOpen ? "show" : ""}`}
        onClick={closeMenu}
      ></div>

      <style>{`
        .main-header { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; background: var(--primary); padding: 0.5rem 0 0; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header-top { display: flex; align-items: center; gap: 1.5rem; justify-content: space-between; height: 50px; margin-bottom: 0.5rem; }
        
        .flipkart-logo { display: flex; flex-direction: column; color: white; font-style: italic; text-decoration: none; }
        .logo-main { font-size: 1.4rem; font-weight: 800; line-height: 1; }
        .logo-sub { font-size: 0.75rem; font-weight: 600; color: #ffe500; }
        .plus { font-style: normal; font-weight: 900; }
        
        .search-bar { background: white; border-radius: 4px; display: flex; align-items: center; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); width: 100%; border: 1px solid transparent; transition: all 0.3s; }
        .search-bar:focus-within { border-color: #ffe500; box-shadow: 0 1px 8px rgba(0,0,0,0.2); }
        .search-bar input { border: none; outline: none; padding: 0.6rem 1rem; flex: 1; font-size: 0.95rem; color: #333; }
        .search-btn { background: none; border: none; padding: 0 1rem; cursor: pointer; font-size: 1.2rem; }
        
        .desktop-search { flex: 1; max-width: 600px; margin: 0 2rem; }
        .mobile-search { display: none; margin-top: 0.5rem; width: 100%; padding: 0 10px 10px; }

        .nav-items-list { display: flex; align-items: center; gap: 2rem; list-style: none; font-weight: 600; }
        .user-label { cursor: pointer; display: flex; align-items: center; gap: 0.5rem; position: relative; padding: 0.5rem 0; font-size: 1rem; }
        .user-avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid transparent; }
        .user-avatar-circle { width: 36px; height: 36px; border-radius: 50%; background: #ffe500; color: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; border: 2px solid transparent; }
        .dropdown-arrow { font-size: 0.8rem; margin-left: 2px; }
        .admin-avatar { border-color: #03a9f4; box-shadow: 0 0 5px rgba(3,169,244,0.5); }
        .login-btn { background: white; color: var(--primary); padding: 0.4rem 2.5rem; border-radius: 2px; font-size: 1rem; transition: background 0.3s; text-decoration: none; display: block; }
        .login-btn:hover { background: #f0f0f0; }
        .cart-nav { display: flex; align-items: center; gap: 0.6rem; font-size: 1rem; text-decoration: none; color: white; }
        .cart-badge { background: #ff6161; padding: 2px 7px; border-radius: 10px; font-size: 0.75rem; vertical-align: top; margin-left: -5px; }
        .theme-toggle { background: rgba(255,255,255,0.15); border: none; border-radius: 50%; width: 35px; height: 35px; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: background 0.3s; }
        .theme-toggle:hover { background: rgba(255,255,255,0.25); }

        /* Mega Menu Navigation */
        .mega-menu-nav { background: white; border-bottom: 1px solid rgba(0,0,0,0.1); position: relative; }
        .mega-menu-list { display: flex; justify-content: flex-start; gap: 3rem; list-style: none; padding: 0; max-width: 1248px; margin: 0 auto; height: 50px; }
        .mega-menu-item { position: static; display: flex; align-items: center; height: 100%; }
        .mega-menu-link { text-decoration: none; color: #212121; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.3px; transition: color 0.3s; display: flex; align-items: center; height: 100%; position: relative; padding: 0 0.5rem; }
        
        .mega-menu-item:hover .mega-menu-link { color: #f4333e; }
        .mega-menu-link::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 4px; background: #f4333e; transition: width 0.2s ease; }
        .mega-menu-item:hover .mega-menu-link::after { width: 100%; }

        .new-badge { font-size: 0.6rem; color: #f4333e; position: absolute; top: 10px; right: -25px; font-weight: 700; }

        /* Mega Dropdown - Absolute to nav to span width */
        .mega-dropdown { 
          display: none; 
          position: absolute; 
          top: 50px; 
          left: 0; 
          width: 100%; 
          background: white; 
          padding: 2.5rem 0; 
          box-shadow: 0 15px 30px rgba(0,0,0,0.15); 
          z-index: 2000; 
          border-bottom: 1px solid #f0f0f0;
          animation: megaFadeIn 0.3s ease;
        }
        
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mega-menu-item:hover .mega-dropdown { display: block; }
        
        .mega-dropdown-inner { 
          display: flex; 
          gap: 2rem; 
          max-width: 1248px; 
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .mega-column { flex: 1; min-width: 150px; }
        .mega-cat-title { color: #f4333e; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 1.2rem; }
        .mega-cat-list { list-style: none; padding: 0; }
        .mega-cat-list li { margin-bottom: 0.6rem; }
        .mega-cat-list a { text-decoration: none; color: #444; font-size: 0.85rem; transition: color 0.1s; }
        .mega-cat-list a:hover { color: #212121; font-weight: 700; }

        .mobile-toggle { display: none; background: none; flex-direction: column; gap: 5px; padding: 5px; border: none; cursor: pointer; }
        .mobile-toggle .bar { width: 22px; height: 2px; background: white; transition: 0.3s; }
        .mobile-toggle.active .bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .mobile-toggle.active .bar:nth-child(2) { opacity: 0; }
        .mobile-toggle.active .bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .header-actions-mobile { display: none; }

        /* Dropdown (Account) */
        .account-dropdown { position: relative; }
        .dropdown-content { display: none; position: absolute; top: 100%; right: 0; background: white; box-shadow: 0 8px 20px rgba(0,0,0,0.18); border-radius: 4px; min-width: 180px; z-index: 1001; margin-top: 5px; border-top: 3px solid var(--primary); }
        .dropdown:hover .dropdown-content { display: block; }
        .dropdown-content a, .dropdown-content button { display: block; padding: 0.8rem 1.2rem; color: #212121; text-align: left; width: 100%; border: none; background: none; font-size: 0.9rem; transition: background 0.2s; text-decoration: none; }
        .dropdown-content a:hover, .dropdown-content button:hover { background: #f5f7fa; color: var(--primary); }

        /* Mobile Drawer Redesign */
        .mobile-drawer { position: fixed; top: 0; left: -100%; width: 280px; height: 100%; background: white; box-shadow: 2px 0 10px rgba(0,0,0,0.1); z-index: 2005; transition: 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); display: flex; flex-direction: column; }
        .mobile-drawer.open { left: 0; }
        .drawer-header { background: var(--primary); color: white; padding: 2rem 1.5rem; display: flex; align-items: center; gap: 1rem; position: relative; }
        .user-icon-bg { width: 45px; height: 45px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .mobile-user-avatar-img { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid transparent; }
        .mobile-user-avatar-circle { width: 45px; height: 45px; border-radius: 50%; background: #ffe500; color: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.4rem; border: 2px solid transparent; }
        .close-drawer { position: absolute; top: 1.2rem; right: 1rem; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; }
        .user-info { flex: 1; }
        .user-details { display: flex; flex-direction: column; }
        .user-greeting { font-size: 0.7rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; }
        .user-name { font-size: 1.1rem; font-weight: 700; }
        .login-prompt { color: white; text-decoration: none; font-weight: 700; font-size: 1rem; }

        .drawer-content { flex: 1; overflow-y: auto; padding: 1rem 0; }
        .drawer-links { list-style: none; padding: 0; }
        .drawer-section-title { padding: 0.8rem 1.5rem 0.4rem; font-size: 0.7rem; color: #878787; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .drawer-links li a, .drawer-links li button { display: flex; align-items: center; padding: 0.8rem 1.5rem; color: #212121; text-decoration: none; font-size: 0.95rem; font-weight: 600; width: 100%; border: none; background: none; cursor: pointer; text-align: left; }
        .drawer-links li a:active, .drawer-links li button:active { background: #f1f3f6; color: var(--primary); }
        .new-tag-sm { font-size: 0.5rem; background: #f4333e; color: white; padding: 1px 4px; border-radius: 2px; margin-left: 5px; }
        .drawer-logout-btn { color: #f4333e !important; }

        .drawer-footer { padding: 1.5rem; border-top: 1px solid #f0f0f0; }
        .mobile-theme-toggle { width: 100%; padding: 0.8rem; border-radius: 4px; border: 1px solid #ddd; background: #fdfdfd; font-weight: 700; color: #212121; cursor: pointer; }

        .drawer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2004; opacity: 0; visibility: hidden; transition: 0.3s; }
        .drawer-overlay.show { opacity: 1; visibility: visible; }

        @media (max-width: 1200px) {
           .mega-menu-list, .mega-dropdown-inner { max-width: 95vw; }
        }

        @media (max-width: 992px) {
           .mega-menu-list { gap: 1.5rem; }
           .desktop-search { margin: 0 1rem; }
        }

        @media (max-width: 768px) {
          .main-header { padding-bottom: 0; }
          .mega-menu-nav { display: none; }
          .desktop-search, .desktop-actions { display: none; }
          .mobile-toggle, .mobile-search, .header-actions-mobile { display: flex; }
          .header-top { gap: 1rem; height: 45px; margin-bottom: 0.3rem; }
          .cart-mobile { font-size: 1.4rem; position: relative; color: white; text-decoration: none; }
          .cart-mobile .badge { position: absolute; top: -5px; right: -8px; background: #ff6b6b; font-size: 0.65rem; padding: 2px 5px; border-radius: 10px; border: 1.5px solid var(--primary); }
          .flipkart-logo { transform: scale(0.9); }
        }
      `}</style>
    </header>
  );
};

export default Header;
