import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ActionDropdown.css';

// Dropdown menu width in px – keep in sync with CSS
const MENU_WIDTH = 180;
const MENU_ITEM_HEIGHT = 40; // approx px per item
const MENU_PADDING = 8;      // top + bottom CSS padding (4px each)

const ActionDropdown = ({ onAction, order }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const actions = [
    { id: 'view',     label: 'View Details',      icon: '↗️' },
    { id: 'edit',     label: 'Edit Order',         icon: '👤' },
    { id: 'invoice',  label: 'Download Invoice',   icon: '☑️' },
    { id: 'reminder', label: 'Send Reminder',      icon: '🔔',  disabled: order.isPaid || order.paymentStatus === 'PAID' },
    { id: 'delete',   label: 'Delete Order',       icon: '🗑️', color: '#ff4d4f' },
  ];

  // Compute portal position every time the menu opens
  const computePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const menuHeight = actions.length * MENU_ITEM_HEIGHT + MENU_PADDING;
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const spaceBelow = viewportH - rect.bottom;
    const spaceAbove = rect.top;

    // Vertical: open upward if not enough space below
    let top;
    if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
      top = rect.bottom + 6; // below button
    } else {
      top = rect.top - menuHeight - 6; // above button
    }

    // Horizontal: align right edge of menu with right edge of button,
    // but prevent going off the left/right screen edges
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > viewportW - 8) left = viewportW - MENU_WIDTH - 8;

    setMenuStyle({ top, left });
  }, [actions.length]);

  const openMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      computePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen]);

  // Recompute on scroll / resize so the menu tracks the button
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      computePosition();
    };
    window.addEventListener('scroll', update, true); // capture: catches scrollable parents
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, computePosition]);

  const handleAction = (actionId) => {
    onAction(actionId, order);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        className="dot-menu-btn"
        onClick={openMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        •••
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="dropdown-menu-list portal-dropdown"
          style={{
            position: 'fixed',
            top: menuStyle.top,
            left: menuStyle.left,
            width: MENU_WIDTH,
            zIndex: 99999,
          }}
        >
          {actions.map((action) => (
            <button
              key={action.id}
              className={`dropdown-item${action.disabled ? ' disabled' : ''}`}
              style={{ color: action.color }}
              onClick={() => !action.disabled && handleAction(action.id)}
            >
              <span className="dropdown-icon">{action.icon}</span>
              <span className="dropdown-label">{action.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default ActionDropdown;
