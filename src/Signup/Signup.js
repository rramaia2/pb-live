import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SlidingNotification from './SlidingNotification';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [notification, setNotification] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('http://167.172.24.111/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, firstName, lastName }),
      });

      if (response.ok) {
        setNotification('You have Successfully Signed UP! Please login.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 5000);
      } else {
        const errorResponse = await response.json();
        console.error('Sign Up failed:', errorResponse.error);
        alert('Sign Up failed. Please try again.');
        setNotification('Sign Up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Sign Up failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Register Page</h2>
      <form style={styles.form}>
        <label style={styles.label}>
          <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} />
        </label>
       
        <label style={styles.label}>
          <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} />
        </label>
        <br />
        <label style={styles.label}>
          <input type="text" placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.input} />
        </label>
        <br />
        <label style={styles.label}>
          <input type="text" placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.input} />
        </label>
        <br />
        <button type="button" onClick={handleRegister} style={styles.button}>
        Sign Up
        </button>
      </form>
      <Link to="/login" style={styles.loginLink}>
        <button type="button" className="register-button">
          Back to Login
        </button>
      </Link>
      <SlidingNotification message={notification} onClose={() => setNotification('')} />
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    maxWidth: '50%', /* Adjust the width as needed */
    width: '100%',
    margin: '50px auto',
    padding: '100px 140px',
    boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
    backgroundColor: '#99c7d2', // Light background color
    borderRadius: '50%', // Make it circular
    overflow: 'hidden', // Ensure content stays within the circle
  },
  heading: {
    fontSize: '24px',
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '10px',
  },
  input: {
    height: '40px',
    width: '100%',
    outline: 'none',
    border: 'none',
    padding: '0 10px',
    fontSize: '16px',
    fontWeight: '500',
    borderBottom: '2px solid rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  button: {
    marginTop: '20px',
    color: '#fff',
    backgroundColor: '#0dcaf0', //login button color
    borderRadius: '600px',
    padding: '10px',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    border: 'none',
    outline: 'none',
  },
  registerButton: {
    display: 'block',
    marginTop: '10px',
    color: '#0dcaf0',
    cursor: 'pointer',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: '500',
    transition: 'color 0.4s ease',
  },
};

export default RegisterPage;
