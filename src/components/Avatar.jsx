import React from 'react';
import { API_BASE_URL } from '../config';

const Avatar = ({ user, size = 40, className = "" }) => {
  if (!user) return null;

  const isAdmin = user.isAdmin;
  const hasAvatar = user.avatar && user.avatar !== "";
  
  const avatarUrl = hasAvatar 
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`)
    : null;

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size / 2.5}px`,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    border: isAdmin ? '2px solid #03a9f4' : '2px solid transparent',
    boxShadow: isAdmin ? '0 0 5px rgba(3, 169, 244, 0.3)' : 'none',
    backgroundColor: '#ffe500',
    color: '#333',
    overflow: 'hidden'
  };

  return (
    <div className={`avatar-component ${className}`} style={style}>
      {hasAvatar ? (
        <img 
          src={avatarUrl} 
          alt={user.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{(user.name || "U")[0]}</span>
      )}
    </div>
  );
};

export default Avatar;
