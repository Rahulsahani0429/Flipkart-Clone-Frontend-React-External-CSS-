import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const InfoPage = () => {
  const { slug } = useParams();

  const getPageContent = (slug) => {
    switch (slug) {
      case 'about':
      case 'about-us':
        return {
          title: 'About Us',
          content: 'Flipkart is India\'s leading e-commerce marketplace with over 80 million products across 80+ categories. Since our inception in 2007, we have been committed to providing a world-class shopping experience to millions of customers across the country. Our focus on innovation, customer-centricity, and technological excellence has made us a household name in India.'
        };
      case 'contact':
      case 'contact-us':
        return {
          title: 'Contact Us',
          content: 'We are here to help you. For any queries regarding your orders, payments, or returns, please reach out to our customer support team. \n\nHelp Center: Available 24/7 in the app/website.\nEmail: support@flipkart.com\nPhone: 044-45614700\n\nRegistered Office: Buildings Alyssa, Begonia & Cove Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru, 560103, Karnataka, India'
        };
      case 'careers':
        return {
          title: 'Careers',
          content: 'At Flipkart, we are building for the next billion users. We look for builders, thinkers, and innovators who want to make a real impact. Join a team that values speed, agility, and bold thinking. Explore opportunities in Engineering, Product, Design, Marketing, and more. Come, shape the future of commerce in India.'
        };
      case 'press':
        return {
          title: 'Press',
          content: 'Welcome to the Flipkart Press Room. Here you will find the latest news, official statements, and media resources. For media inquiries, please contact our corporate communications team at press@flipkart.com.'
        };
      case 'corporate-information':
        return {
          title: 'Corporate Information',
          content: 'Flipkart Internet Private Limited is a subsidiary of the Flipkart Group. We operate with a strong commitment to corporate governance, transparency, and ethical business practices. Our leadership team consists of industry veterans dedicated to driving growth and sustainability.'
        };
      case 'payments':
        return {
          title: 'Payments',
          content: 'We offer a wide range of secure payment options to make your shopping experience seamless. You can pay using Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, UPI (PhonePe, Google Pay), and Cash on Delivery (COD). All transactions are processed through secure, encrypted gateways to ensure your financial safety.'
        };
      case 'shipping':
        return {
          title: 'Shipping',
          content: 'We strive to deliver your orders as quickly as possible. Our robust logistics network covers over 19,000 pin codes across India. Delivery times vary based on your location and the seller\'s warehouse. You can track your shipment in real-time through the "My Orders" section.'
        };
      case 'cancellation-returns':
        return {
          title: 'Cancellation & Returns',
          content: 'We have a customer-friendly cancellation and return policy. You can cancel your order before it is shipped for a full refund. For returns, most products have a 7-30 day return window if the item is unused and in its original packaging. Please check the product page for specific return details.'
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          content: 'Got questions? We have answers. Find detailed information about managing your account, tracking orders, payment troubleshooting, and how to use Flipkart Gift Cards. Our FAQ section is designed to help you resolve common issues quickly.'
        };
      case 'terms':
      case 'terms-of-use':
        return {
          title: 'Terms of Use',
          content: 'By accessing or using the Flipkart platform, you agree to be bound by these Terms of Use. These terms govern your rights and obligations as a user, including intellectual property, user conduct, and limitation of liability. Please read them carefully before using our services.'
        };
      case 'security':
        return {
          title: 'Security',
          content: 'Your data security is our top priority. We use world-class encryption, multi-factor authentication, and continuous monitoring to protect your personal and financial information from unauthorized access. Shop with confidence knowing your details are safe with us.'
        };
      case 'privacy':
      case 'privacy-policy':
        return {
          title: 'Privacy Policy',
          content: 'We value the trust you place in us. That\'s why we insist upon the highest standards for secure transactions and customer information privacy. Our privacy policy describes how we collect, use, share, and protect your personal information. We do not sell your personal data to third parties.'
        };
      case 'sitemap':
        return {
          title: 'Sitemap',
          content: 'Explore our complete site map to find exactly what you\'re looking for. From product categories and brand stores to help articles and policy pages, our sitemap provides an organized view of all the resources available on Flipkart.'
        };
      case 'grievance':
      case 'grievance-redressal':
        return {
          title: 'Grievance Redressal',
          content: 'At Flipkart, we strive to provide the best service, but if you have any concerns, our Grievance Redressal mechanism is here to help. You can escalate your issues to our Grievance Officer, who will investigate and resolve them within the stipulated timelines as per Indian laws.'
        };
      case 'epr-compliance':
        return {
          title: 'EPR Compliance',
          content: 'As a responsible corporate citizen, Flipkart is committed to the environment. Our Extended Producer Responsibility (EPR) compliance ensures the safe disposal and recycling of electronic waste. We partner with authorized recyclers to minimize our environmental footprint.'
        };
      case 'seller-info':
        return {
          title: 'Become a Seller',
          content: 'Grow your business by selling to over 400 million customers across India. With low commission rates, powerful analytics, and seamless logistics support, Flipkart is the preferred destination for entrepreneurs. Register today and start selling in just a few simple steps.'
        };
      case 'advertise':
        return {
          title: 'Advertise',
          content: 'Target the right customers at the right time with Flipkart Ads. Whether you want to drive brand awareness or boost sales, our advertising solutions offer precise targeting and measurable results. Join thousands of brands that grow with us every day.'
        };
      case 'gift-cards':
        return {
          title: 'Gift Cards',
          content: 'Flipkart Gift Cards are the perfect gift for any occasion. They are easy to send and give the recipient the freedom to choose from millions of products. Available in various denominations, they never expire and can be combined with other payment modes.'
        };
      default:
        return {
          title: 'Information',
          content: 'This page contains important information about our services and policies.'
        };
    }
  };

  const { title, content } = getPageContent(slug);

  return (
    <div className="container" style={{ padding: '4rem 1rem', minHeight: '70vh', background: '#f1f3f6' }}>
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        background: '#fff', 
        padding: '3rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ 
          marginBottom: '2rem', 
          color: '#212121', 
          fontSize: '2rem',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '1rem' 
        }}>{title}</h1>
        <div style={{ color: '#444', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <div style={{ whiteSpace: 'pre-line' }}>
            {content}
          </div>
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f0f0f0', fontSize: '0.9rem', color: '#878787' }}>
            <p>Last updated: February 2026</p>
            <p>&copy; 2007–2026 Flipkart.com. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
