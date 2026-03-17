import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const NotificationIcon = ({ isAdmin = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id) => {
    markAsRead(id);
    setDropdownOpen(false);
  };

  const getNotificationLink = (notification) => {
    if (isAdmin) {
      if (notification.type === "order") return "/admin/orders";
      if (notification.type === "stock") return "/admin/products";
      if (notification.type === "payment" || notification.type.startsWith("PAYMENT_") || notification.type === "RECEIPT_SENT" || notification.type.startsWith("RETURN_")) return "/admin/orders";
      return "/admin";
    } else {
      if (notification.meta && notification.meta.redirectUrl) return notification.meta.redirectUrl;
      if (notification.type.startsWith("PAYMENT_") || notification.type === "RECEIPT_SENT" || notification.type.startsWith("RETURN_")) return `/orders/${notification.relatedId}`;
      if (notification.relatedId) return `/orders/${notification.relatedId}`;
      return "/profile";
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button className="notification-bell-btn" onClick={toggleDropdown}>
        <span className="bell-emoji">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {dropdownOpen && (
        <div className={`notification-dropdown ${isAdmin ? "admin-dropdown" : ""}`}>
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && <span>{unreadCount} New</span>}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">No notifications</div>
            ) : (
              notifications.map((n) => (
                <Link
                  to={getNotificationLink(n)}
                  key={n._id}
                  className={`notification-item ${n.isRead ? "read" : "unread"}`}
                  onClick={() => handleNotificationClick(n._id)}
                >
                  <div className="notification-icon">
                    {n.type === "order" ? "📦" : 
                     n.type === "payment" || n.type === "PAYMENT_SUCCESS" ? "💰" : 
                     n.type === "PAYMENT_FAILED" ? "⚠️" :
                     n.type === "PAYMENT_REFUNDED" ? "💵" :
                     n.type === "RECEIPT_SENT" ? "🧾" :
                     n.type.startsWith("RETURN_") ? "↩️" :
                     n.type === "stock" ? "📉" : "ℹ️"}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{n.title}</p>
                    <p className="notification-message">{n.message}</p>
                    <span className="notification-time">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {!n.isRead && <div className="unread-dot"></div>}
                </Link>
              ))
            )}
          </div>
          {notifications.length > 0 && (
             <div className="notification-footer">
               <Link to={isAdmin ? "/admin/notifications" : "/profile"} onClick={() => setDropdownOpen(false)}>
                 View All
               </Link>
             </div>
          )}
        </div>
      )}

      <style>{`
        .notification-wrapper { position: relative; }
        .notification-bell-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; position: relative; padding: 5px; color: inherit; display: flex; align-items: center; justify-content: center; }
        .bell-emoji { line-height: 1; }
        .notification-badge { position: absolute; top: 0; right: 0; background: #ff4d4f; color: white; font-size: 0.7rem; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-weight: bold; }
        
        .notification-dropdown { position: absolute; top: 100%; right: 0; width: 320px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; z-index: 2000; margin-top: 10px; overflow: hidden; color: #333; }
        .admin-dropdown { right: -10px; border: 1px solid #eee; }
        
        .notification-header { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .notification-header h3 { margin: 0; font-size: 1rem; color: #212121; }
        .notification-header span { font-size: 0.8rem; background: #f0f0f0; padding: 2px 8px; border-radius: 12px; color: #666; }
        
        .notification-list { max-height: 400px; overflow-y: auto; }
        .empty-notifications { padding: 30px; text-align: center; color: #999; font-size: 0.9rem; }
        
        .notification-item { display: flex; gap: 12px; padding: 12px 16px; text-decoration: none; color: inherit; border-bottom: 1px solid #f9f9f9; transition: background 0.2s; position: relative; }
        .notification-item:hover { background: #f5f7fa; }
        .notification-item.unread { background: #f0f7ff; }
        .notification-item.unread:hover { background: #e6f1ff; }
        
        .notification-icon { font-size: 1.2rem; margin-top: 2px; }
        .notification-content { flex: 1; }
        .notification-title { margin: 0; font-weight: 700; font-size: 0.85rem; color: #212121; margin-bottom: 2px; }
        .notification-message { margin: 0; font-size: 0.8rem; color: #666; line-height: 1.3; }
        .notification-time { display: block; margin-top: 4px; font-size: 0.7rem; color: #999; }
        
        .unread-dot { width: 8px; height: 8px; background: #2874f0; border-radius: 50%; position: absolute; top: 16px; right: 16px; }
        
        .notification-footer { padding: 10px; text-align: center; border-top: 1px solid #f0f0f0; background: #fdfdfd; }
        .notification-footer a { font-size: 0.85rem; font-weight: 600; color: #2874f0; text-decoration: none; }
        .notification-footer a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default NotificationIcon;
