import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import './Cart.css';

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCheckout = async () => {
    // Prepare order data
    const orderData = {
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customCoffee: item.customCoffee || undefined
      })),
      totalAmount: getCartTotal()
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setToast('Order placed successfully! 🎉');
        setTimeout(() => {
          clearCart();
          setShowCheckout(false);
        }, 2000);
      } else {
        setToast('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setToast('Error placing order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart container">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="empty-cart">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="cart container">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <h1 className="page-title">Shopping Cart</h1>
      
      <div className="cart-items">
        {cart.map((item, index) => (
          <div key={index} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              {item.customCoffee && (
                <div className="custom-coffee-details">
                  <p><strong>Custom Coffee:</strong></p>
                  <p>Sugar: {item.customCoffee.sugar} tsp</p>
                  <p>Milk: {item.customCoffee.milk}</p>
                  <p>Coffee: {item.customCoffee.coffee} shot(s)</p>
                  <p>Chocolate: {item.customCoffee.chocolate} pump(s)</p>
                </div>
              )}
              <p className="cart-item-price">${item.price.toFixed(2)}</p>
            </div>
            <div className="cart-item-quantity">
              <button onClick={() => updateQuantity(index, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
            </div>
            <div className="cart-item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button 
              className="btn btn-secondary remove-btn"
              onClick={() => removeFromCart(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-details">
          <div className="summary-row">
            <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="summary-row total-row">
            <span>Total:</span>
            <span className="total-amount">${getCartTotal().toFixed(2)}</span>
          </div>
        </div>
        
        {!showCheckout ? (
          <>
            <button className="btn btn-primary checkout-btn" onClick={() => setShowCheckout(true)}>
              Proceed to Checkout
            </button>
            <button className="btn btn-secondary" onClick={clearCart}>Clear Cart</button>
          </>
        ) : (
          <div className="checkout-confirmation">
            <h3>Confirm Your Order</h3>
            <p>You are about to place an order for {cart.length} item{cart.length > 1 ? 's' : ''}</p>
            <p className="checkout-total">Total: ${getCartTotal().toFixed(2)}</p>
            <button className="btn btn-primary" onClick={handleCheckout}>
              Place Order
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCheckout(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
