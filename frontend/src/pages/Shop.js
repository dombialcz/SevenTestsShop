import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import './Shop.css';

function Shop() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [addedToCart, setAddedToCart] = useState(null);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories/all');
      const data = await response.json();
      setCategories(['All', ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedToCart(product._id);
    setToast(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedToCart(null), 1000);
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="shop container">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Shop</h1>
      
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                >
                  {addedToCart === product._id ? '✓ Added!' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
