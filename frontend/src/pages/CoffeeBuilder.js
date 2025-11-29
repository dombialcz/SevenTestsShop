import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CoffeeBuilder.css';

function CoffeeBuilder() {
  const [sugar, setSugar] = useState(0);
  const [milk, setMilk] = useState('none');
  const [coffee, setCoffee] = useState(1);
  const [chocolate, setChocolate] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const basePrice = 3.50;
  const addOns = {
    sugar: 0.25,
    milk: { regular: 0.50, oat: 0.75 },
    coffee: 0.75,
    chocolate: 0.50
  };

  const calculatePrice = () => {
    let price = basePrice;
    price += sugar * addOns.sugar;
    if (milk === 'regular') price += addOns.milk.regular;
    if (milk === 'oat') price += addOns.milk.oat;
    price += (coffee - 1) * addOns.coffee;
    price += chocolate * addOns.chocolate;
    return price;
  };

  const handleAddToCart = () => {
    const customCoffee = {
      name: 'Custom Coffee',
      price: calculatePrice(),
      category: 'Coffee',
      description: 'Your custom coffee creation',
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzhCNDUxMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj7imJUgQ3VzdG9tPC90ZXh0Pjwvc3ZnPg==',
      _id: 'custom-coffee-' + Date.now()
    };

    const coffeeConfig = {
      sugar,
      milk,
      coffee,
      chocolate
    };

    addToCart(customCoffee, 1, coffeeConfig);
    navigate('/cart');
  };

  return (
    <div className="coffee-builder container">
      <h1 className="page-title">Build Your Coffee</h1>
      
      <div className="builder-container">
        <div className="builder-options">
          <div className="option-group">
            <label>Sugar (teaspoons)</label>
            <div className="control-group">
              <button onClick={() => setSugar(Math.max(0, sugar - 1))}>-</button>
              <span className="value">{sugar}</span>
              <button onClick={() => setSugar(Math.min(5, sugar + 1))}>+</button>
            </div>
            <span className="price-addition">+${(sugar * addOns.sugar).toFixed(2)}</span>
          </div>

          <div className="option-group">
            <label>Milk Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="none"
                  checked={milk === 'none'}
                  onChange={(e) => setMilk(e.target.value)}
                />
                None
              </label>
              <label>
                <input
                  type="radio"
                  value="regular"
                  checked={milk === 'regular'}
                  onChange={(e) => setMilk(e.target.value)}
                />
                Regular (+${addOns.milk.regular.toFixed(2)})
              </label>
              <label>
                <input
                  type="radio"
                  value="oat"
                  checked={milk === 'oat'}
                  onChange={(e) => setMilk(e.target.value)}
                />
                Oat (+${addOns.milk.oat.toFixed(2)})
              </label>
            </div>
          </div>

          <div className="option-group">
            <label>Coffee Shots</label>
            <div className="control-group">
              <button onClick={() => setCoffee(Math.max(1, coffee - 1))}>-</button>
              <span className="value">{coffee}</span>
              <button onClick={() => setCoffee(Math.min(4, coffee + 1))}>+</button>
            </div>
            <span className="price-addition">+${((coffee - 1) * addOns.coffee).toFixed(2)}</span>
          </div>

          <div className="option-group">
            <label>Chocolate Pumps</label>
            <div className="control-group">
              <button onClick={() => setChocolate(Math.max(0, chocolate - 1))}>-</button>
              <span className="value">{chocolate}</span>
              <button onClick={() => setChocolate(Math.min(5, chocolate + 1))}>+</button>
            </div>
            <span className="price-addition">+${(chocolate * addOns.chocolate).toFixed(2)}</span>
          </div>
        </div>

        <div className="builder-summary">
          <h2>Your Coffee</h2>
          <div className="summary-details">
            <p><strong>Sugar:</strong> {sugar} tsp</p>
            <p><strong>Milk:</strong> {milk}</p>
            <p><strong>Coffee Shots:</strong> {coffee}</p>
            <p><strong>Chocolate:</strong> {chocolate} pump(s)</p>
          </div>
          <div className="price-summary">
            <span>Total Price:</span>
            <span className="final-price">${calculatePrice().toFixed(2)}</span>
          </div>
          <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoffeeBuilder;
