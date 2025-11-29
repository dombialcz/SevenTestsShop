import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Demo Shop</h1>
        <p>Your one-stop shop for everything you need</p>
        <div className="hero-buttons">
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          <Link to="/coffee-builder" className="btn btn-secondary">Build Your Coffee</Link>
        </div>
      </div>
      
      <div className="features">
        <div className="feature">
          <h3>4 Categories</h3>
          <p>Electronics, Clothing, Books, and Coffee</p>
        </div>
        <div className="feature">
          <h3>Custom Coffee</h3>
          <p>Build your perfect cup with custom options</p>
        </div>
        <div className="feature">
          <h3>Easy Shopping</h3>
          <p>Simple cart management with local storage</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
