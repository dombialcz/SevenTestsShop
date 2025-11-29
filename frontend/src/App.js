import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import CoffeeBuilder from './pages/CoffeeBuilder';
import Admin from './pages/Admin';
import { CartProvider, useCart } from './context/CartContext';
import './App.css';

function NavBar() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Demo Shop
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/shop" className="nav-link">Shop</Link>
          </li>
          <li className="nav-item">
            <Link to="/coffee-builder" className="nav-link">Build Coffee</Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-link">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/admin" className="nav-link">Admin</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <NavBar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/coffee-builder" element={<CoffeeBuilder />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
