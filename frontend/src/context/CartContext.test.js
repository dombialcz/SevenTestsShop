import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Test component to access cart context
function TestComponent() {
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{getCartCount()}</div>
      <div data-testid="cart-total">{getCartTotal()}</div>
      <div data-testid="cart-items">{JSON.stringify(cart)}</div>
      <button onClick={() => addToCart({ _id: '1', name: 'Test Product', price: 10 }, 1)}>
        Add Product
      </button>
      <button onClick={() => addToCart({ _id: '2', name: 'Coffee', price: 15 }, 1, { size: 'large' })}>
        Add Custom Coffee
      </button>
      <button onClick={() => removeFromCart(0)}>Remove First Item</button>
      <button onClick={() => updateQuantity(0, 3)}>Update Quantity</button>
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides cart context to children', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
  });

  test('adds product to cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('10');
  });

  test('increases quantity when adding same product', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
      screen.getByText('Add Product').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('20');
  });

  test('adds custom coffee as separate item', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Custom Coffee').click();
      screen.getByText('Add Custom Coffee').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('30');
  });

  test('removes item from cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    act(() => {
      screen.getByText('Remove First Item').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  test('updates item quantity', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    act(() => {
      screen.getByText('Update Quantity').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('30');
  });

  test('removes item when quantity updated to 0', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
  });

  test('clears entire cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
      screen.getByText('Add Custom Coffee').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');

    act(() => {
      screen.getByText('Clear Cart').click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });

  test('calculates cart total correctly', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click(); // $10
      screen.getByText('Add Custom Coffee').click(); // $15
    });

    expect(screen.getByTestId('cart-total')).toHaveTextContent('25');
  });

  test('persists cart to localStorage', async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      screen.getByText('Add Product').click();
    });

    await waitFor(() => {
      const savedCart = localStorage.getItem('cart');
      expect(savedCart).toContain('Test Product');
    });
  });

  test('loads cart from localStorage on mount', () => {
    const savedCart = JSON.stringify([
      { _id: '1', name: 'Saved Product', price: 20, quantity: 2 }
    ]);
    
    localStorage.setItem('cart', savedCart);

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-total')).toHaveTextContent('40');
  });

  test('throws error when useCart is used outside CartProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');

    consoleSpy.mockRestore();
  });
});
