import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import './Admin.css';

function Admin() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToast('Failed to load products');
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: editingProduct.price,
          inStock: editingProduct.inStock
        })
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => 
          p._id === updatedProduct._id ? updatedProduct : p
        ));
        setToast(`Updated "${editingProduct.name}" successfully!`);
        setEditingProduct(null);
      } else {
        setToast('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setToast('Error updating product');
    }
  };

  const handleChange = (field, value) => {
    setEditingProduct({
      ...editingProduct,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="admin container">
        <h1 className="page-title">Admin Panel</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="admin container">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Admin Panel</h1>
      <p className="admin-subtitle">Manage product prices and inventory</p>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>In Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className={editingProduct?._id === product._id ? 'editing' : ''}>
                <td>
                  <div className="product-cell">
                    <img src={product.image} alt={product.name} className="product-thumbnail" />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>
                  {editingProduct?._id === product._id ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.price}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                      className="price-input"
                    />
                  ) : (
                    `$${product.price.toFixed(2)}`
                  )}
                </td>
                <td>
                  {editingProduct?._id === product._id ? (
                    <label className="stock-toggle">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock}
                        onChange={(e) => handleChange('inStock', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  ) : (
                    <span className={`stock-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                      {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </span>
                  )}
                </td>
                <td>
                  {editingProduct?._id === product._id ? (
                    <div className="action-buttons">
                      <button className="btn btn-primary btn-sm" onClick={handleSave}>
                        Save
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleEdit(product)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
