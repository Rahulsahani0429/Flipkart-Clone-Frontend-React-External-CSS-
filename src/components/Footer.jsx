import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="fk-footer">
      {/* ═══ Main body ═══ */}
      <div className="fk-footer-body">
        <div className="fk-footer-inner">

          {/* Col 1 – About */}
          <div className="fk-col">
            <h4 className="fk-col-title">ABOUT</h4>
            <ul className="fk-links">
              <li><Link to="/info/contact">Contact Us</Link></li>
              <li><Link to="/info/about">About Us</Link></li>
              <li><Link to="/info/careers">Careers</Link></li>
              <li><Link to="/info/press">Press</Link></li>
              <li><Link to="/info/corporate-information">Corporate Information</Link></li>
            </ul>
          </div>

          {/* Col 2 – Group Companies */}
          <div className="fk-col">
            <h4 className="fk-col-title">GROUP COMPANIES</h4>
            <ul className="fk-links">
              <li><a href="https://www.myntra.com" target="_blank" rel="noopener noreferrer">Myntra</a></li>
              <li><a href="https://www.cleartrip.com" target="_blank" rel="noopener noreferrer">Cleartrip</a></li>
              <li><a href="https://www.shopsy.in" target="_blank" rel="noopener noreferrer">Shopsy</a></li>
            </ul>
          </div>

          {/* Col 3 – Help */}
          <div className="fk-col">
            <h4 className="fk-col-title">HELP</h4>
            <ul className="fk-links">
              <li><Link to="/info/payments">Payments</Link></li>
              <li><Link to="/info/shipping">Shipping</Link></li>
              <li><Link to="/info/cancellation-returns" className="fk-link-ul">Cancellation &amp; Returns</Link></li>
              <li><Link to="/info/faq">FAQ</Link></li>
            </ul>
          </div>

          {/* Col 4 – Consumer Policy */}
          <div className="fk-col">
            <h4 className="fk-col-title">CONSUMER POLICY</h4>
            <ul className="fk-links">
              <li><Link to="/info/cancellation-returns" className="fk-link-ul">Cancellation &amp; Returns</Link></li>
              <li><Link to="/info/terms-of-use">Terms Of Use</Link></li>
              <li><Link to="/info/security">Security</Link></li>
              <li><Link to="/info/privacy">Privacy</Link></li>
              <li><Link to="/info/sitemap">Sitemap</Link></li>
              <li><Link to="/info/grievance-redressal">Grievance Redressal</Link></li>
              <li><Link to="/info/epr-compliance">EPR Compliance</Link></li>
            </ul>
          </div>

          {/* Vertical divider */}
          <div className="fk-vdivider" />

          {/* Col 5 – Mail Us */}
          <div className="fk-col fk-col-mail">
            <h4 className="fk-col-title">MAIL US</h4>
            <address className="fk-address">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &amp;<br />
              Cove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </address>

            <div className="fk-social-row">
              <span className="fk-social-label">Social:</span>
              <div className="fk-socials">
                {/* Facebook */}
                <a href="https://facebook.com" className="fk-social-icon" target="_blank" rel="noreferrer" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                {/* X / Twitter */}
                <a href="https://twitter.com" className="fk-social-icon" target="_blank" rel="noreferrer" aria-label="X">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://youtube.com" className="fk-social-icon" target="_blank" rel="noreferrer" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" className="fk-social-icon" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 6 – Registered Office */}
          <div className="fk-col fk-col-office">
            <h4 className="fk-col-title">REGISTERED OFFICE ADDRESS</h4>
            <address className="fk-address">
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &amp;<br />
              Cove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India<br />
              <br />
              <span className="fk-cin">CIN</span> : U51109KA2012PTC066107<br />
              <span className="fk-addr-phone">
                Telephone: <a href="tel:04445614700">044-45614700</a> / <a href="tel:04445614800">044-67413800</a>
              </span>
            </address>
          </div>

        </div>
      </div>

      {/* ═══ Bottom bar ═══ */}
      <div className="fk-footer-bottom">
        <div className="fk-footer-inner fk-bottom-inner">

          {/* Left – quick links */}
          <div className="fk-bottom-links">
            <Link to="/info/seller-info" className="fk-blink">
              <span className="fk-blink-icon">⭐</span> Become a Seller
            </Link>
            <span className="fk-bsep">|</span>
            <Link to="/info/advertise" className="fk-blink">
              <span className="fk-blink-icon">📢</span> Advertise
            </Link>
            <span className="fk-bsep">|</span>
            <Link to="/info/gift-cards" className="fk-blink">
              <span className="fk-blink-icon">🎁</span> Gift Cards
            </Link>
            <span className="fk-bsep">|</span>
            <Link to="/info/contact" className="fk-blink">
              <span className="fk-blink-icon">❓</span> Help Center
            </Link>
          </div>

          {/* Center – copyright */}
          <div className="fk-copyright">
            &copy; 2007–2026 Flipkart.com
          </div>

          {/* Right – payment icons */}
          <div className="fk-payments">
            {['VISA','MC','RuPay','NetBanking','UPI','EMI','COD'].map(m => (
              <span key={m} className="fk-pay-badge">{m}</span>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
