// SlidingNotification.js
import React from 'react';
import './SlidingNotification.css';  // Import the CSS file

const SlidingNotification = ({ message, onClose }) => {
  return (
    <div className={`sliding-notification ${message ? 'show' : ''}`}>
      <p>{message}</p>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

export default SlidingNotification;
