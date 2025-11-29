import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Shop from './Shop';
import { CartProvider } from '../context/CartContext';

// Mock fetch
global.fetch = jest.fn();

const mockProducts = [
  {
    _id: '1',
    name: 'Espresso',
    category: 'Coffee',
    price: 3.99,
    description: 'Strong coffee',
    image: 'data:image/svg+xml;base64,test',
    inStock: true
  },
  {
    _id: '2',
    name: 'Latte',
    category: 'Coffee',
    price: 4.99,
    description: 'Smooth coffee',
    image: 'data:image/svg+xml;base64,test',
    inStock: true
  },
  {
    _id: '3',
    name: 'Croissant',
    category: 'Pastries',
    price: 2.99,
    description: 'Flaky pastry',
    image: 'data:image/svg+xml;base64,test',
    inStock: false
  }
];

const mockCategories = ['Coffee', 'Pastries'];

function renderShop() {
  return render(
    <BrowserRouter>
      <CartProvider>
        <Shop />
      </CartProvider>
    </BrowserRouter>
  );
}

describe('Shop Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders shop page title', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  test('fetches and displays products', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });

  test('fetches and displays categories', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Pastries')).toBeInTheDocument();
  });

  test('filters products by category', async () => {
    const user = userEvent.setup();
    
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    // Click Coffee category
    const coffeeButton = screen.getByRole('button', { name: 'Coffee' });
    await user.click(coffeeButton);

    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.queryByText('Croissant')).not.toBeInTheDocument();
  });

  test('shows all products when "All" category is selected', async () => {
    const user = userEvent.setup();
    
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    // First filter to Coffee
    const coffeeButton = screen.getByRole('button', { name: 'Coffee' });
    await user.click(coffeeButton);

    // Then click All
    const allButton = screen.getByRole('button', { name: 'All' });
    await user.click(allButton);

    expect(screen.getByText('Espresso')).toBeInTheDocument();
    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('Croissant')).toBeInTheDocument();
  });

  test('displays product prices correctly', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('$3.99')).toBeInTheDocument();
    });

    expect(screen.getByText('$4.99')).toBeInTheDocument();
    expect(screen.getByText('$2.99')).toBeInTheDocument();
  });

  test('disables add to cart button for out of stock items', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('Croissant')).toBeInTheDocument();
    });

    const croissantCard = screen.getByText('Croissant').closest('.product-card');
    const addButton = croissantCard.querySelector('button.btn-primary');

    expect(addButton).toBeDisabled();
    expect(addButton).toHaveTextContent('Out of Stock');
  });

  test('shows toast when item is added to cart', async () => {
    const user = userEvent.setup();
    
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const espressoCard = screen.getByText('Espresso').closest('.product-card');
    const addButton = espressoCard.querySelector('button.btn-primary');

    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Added "Espresso" to cart!/)).toBeInTheDocument();
    });
  });

  test('handles fetch errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    fetch.mockRejectedValue(new Error('Network error'));

    renderShop();

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching products:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  test('highlights active category', async () => {
    const user = userEvent.setup();
    
    fetch.mockImplementation((url) => {
      if (url.includes('/categories/all')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockCategories)
        });
      }
      return Promise.resolve({
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderShop();

    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    const coffeeButton = screen.getByRole('button', { name: 'Coffee' });
    await user.click(coffeeButton);

    expect(coffeeButton).toHaveClass('active');
  });
});
