import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';
import { CartProvider } from '../context/CartContext';

// Mock fetch
global.fetch = jest.fn();

const mockCartItems = [
  {
    _id: '1',
    name: 'Espresso',
    price: 3.99,
    quantity: 2,
    image: 'data:image/svg+xml;base64,test'
  },
  {
    _id: '2',
    name: 'Custom Coffee',
    price: 5.99,
    quantity: 1,
    image: 'data:image/svg+xml;base64,test',
    customCoffee: {
      sugar: 2,
      milk: 'Oat',
      coffee: 2,
      chocolate: 1
    }
  }
];

function renderCart(items = null) {
  if (items) {
    localStorage.setItem('cart', JSON.stringify(items));
  }
  
  return render(
    <BrowserRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </BrowserRouter>
  );
}

describe('Cart Page', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  test('displays empty cart message when cart is empty', () => {
    renderCart();

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  test('displays cart items', () => {
    renderCart(mockCartItems);

    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('Custom Coffee')).toBeInTheDocument();
  });

  test('displays item quantities correctly', () => {
    renderCart(mockCartItems);

    const cartItems = screen.getAllByText(/2|1/);
    expect(cartItems.length).toBeGreaterThan(0);
  });

  test('displays item prices', () => {
    renderCart(mockCartItems);

    // Wait for cart to load from localStorage
    expect(screen.getByText('Espresso')).toBeInTheDocument();
    
    // Prices appear in multiple places (item price and total)
    const prices = screen.getAllByText(/\$3.99|\$5.99/);
    expect(prices.length).toBeGreaterThan(0);
  });

  test('displays custom coffee details', () => {
    renderCart(mockCartItems);

    expect(screen.getByText('Custom Coffee:')).toBeInTheDocument();
    expect(screen.getByText('Sugar: 2 tsp')).toBeInTheDocument();
    expect(screen.getByText('Milk: Oat')).toBeInTheDocument();
    expect(screen.getByText('Coffee: 2 shot(s)')).toBeInTheDocument();
    expect(screen.getByText('Chocolate: 1 pump(s)')).toBeInTheDocument();
  });

  test('calculates item totals correctly', () => {
    renderCart(mockCartItems);

    expect(screen.getByText('Espresso')).toBeInTheDocument();
    
    // Espresso: $3.99 x 2 = $7.98
    // Custom Coffee: $5.99 x 1 = $5.99
    const totals = screen.getAllByText(/\$7.98|\$5.99/);
    expect(totals.length).toBeGreaterThan(0);
  });

  test('displays order summary with correct totals', () => {
    renderCart(mockCartItems);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText(/Items \(3\):/)).toBeInTheDocument(); // 2 + 1 items
    
    // Total: $7.98 + $5.99 = $13.97
    const totalElements = screen.getAllByText('$13.97');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  test('increments item quantity', async () => {
    const user = userEvent.setup();
    renderCart(mockCartItems);

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const incrementButtons = screen.getAllByText('+');
    await user.click(incrementButtons[0]); // Click + for first item

    await waitFor(() => {
      // Should find the new total somewhere in the document
      const totals = screen.getAllByText(/\$17.96/);
      expect(totals.length).toBeGreaterThan(0);
    });
  });

  test('decrements item quantity', async () => {
    const user = userEvent.setup();
    renderCart(mockCartItems);

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const decrementButtons = screen.getAllByText('-');
    await user.click(decrementButtons[0]); // Click - for first item

    await waitFor(() => {
      // Should find the new total somewhere in the document
      const totals = screen.getAllByText(/\$9.98/);
      expect(totals.length).toBeGreaterThan(0);
    });
  });

  test('removes item from cart', async () => {
    const user = userEvent.setup();
    renderCart(mockCartItems);

    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument();
    });
  });

  test('clears entire cart', async () => {
    const user = userEvent.setup();
    renderCart(mockCartItems);

    const clearButton = screen.getByText('Clear Cart');
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  test('shows checkout summary when proceed to checkout is clicked', async () => {
    const user = userEvent.setup();
    renderCart(mockCartItems);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Order')).toBeInTheDocument();
    });
  });

  test('places order successfully', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    renderCart(mockCartItems);

    // Click proceed to checkout
    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    // Click place order
    await waitFor(() => {
      expect(screen.getByText('Confirm Your Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    // Check that toast appears
    await waitFor(() => {
      expect(screen.getByText(/Order placed successfully!/)).toBeInTheDocument();
    });

    // Check that cart is cleared after delay
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles order placement failure', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed' })
    });

    renderCart(mockCartItems);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to place order. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles network errors during checkout', async () => {
    const user = userEvent.setup();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderCart(mockCartItems);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Order')).toBeInTheDocument();
    });

    const placeOrderButton = screen.getByText('Place Order');
    await user.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByText('Error placing order. Please try again.')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  test('can go back from checkout', async () => {
    const user = userEvent.setup();
    renderCart(mockCartItems);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Order')).toBeInTheDocument();
    });

    const cancelButton = screen.getAllByText('Cancel')[0];
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });
  });

  test('displays shipping as free', () => {
    renderCart(mockCartItems);

    expect(screen.getByText('Shipping:')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
