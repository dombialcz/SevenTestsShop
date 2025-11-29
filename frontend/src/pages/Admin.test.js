import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Admin from './Admin';

// Mock fetch
global.fetch = jest.fn();

const mockProducts = [
  {
    _id: '1',
    name: 'Espresso',
    category: 'Coffee',
    price: 3.99,
    inStock: true
  },
  {
    _id: '2',
    name: 'Croissant',
    category: 'Pastries',
    price: 2.99,
    inStock: false
  }
];

function renderAdmin() {
  return render(
    <BrowserRouter>
      <Admin />
    </BrowserRouter>
  );
}

describe('Admin Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders admin page title', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Manage product prices and inventory')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderAdmin();

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  test('fetches and displays products', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    expect(screen.getByText('Croissant')).toBeInTheDocument();
    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.getByText('Pastries')).toBeInTheDocument();
  });

  test('displays product prices correctly', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('$3.99')).toBeInTheDocument();
    });

    expect(screen.getByText('$2.99')).toBeInTheDocument();
  });

  test('displays stock status correctly', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    await waitFor(() => {
      const inStockBadges = screen.getAllByText('✓ In Stock');
      const outOfStockBadges = screen.getAllByText('✗ Out of Stock');
      
      expect(inStockBadges.length).toBeGreaterThan(0);
      expect(outOfStockBadges.length).toBeGreaterThan(0);
    });
  });

  test('enters edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  test('cancels editing when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
  });

  test('updates product price', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    const priceInput = screen.getByDisplayValue('3.99');
    await user.clear(priceInput);
    await user.type(priceInput, '4.99');

    expect(screen.getByDisplayValue('4.99')).toBeInTheDocument();
  });

  test('toggles stock status', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    // Find the toggle switch for the product being edited
    const toggles = screen.getAllByRole('checkbox');
    const inStockToggle = toggles[0];
    
    await user.click(inStockToggle);

    expect(inStockToggle).not.toBeChecked();
  });

  test('saves product changes successfully', async () => {
    const user = userEvent.setup();
    
    const updatedProduct = { ...mockProducts[0], price: 4.99 };
    
    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockProducts) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(updatedProduct) });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    const priceInput = screen.getByDisplayValue('3.99');
    await user.clear(priceInput);
    await user.type(priceInput, '4.99');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Updated "Espresso" successfully!/)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/products/1',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: 4.99,
          inStock: true
        })
      })
    );
  });

  test('handles save failure', async () => {
    const user = userEvent.setup();
    
    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockProducts) })
      .mockResolvedValueOnce({ ok: false });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    const priceInput = screen.getByDisplayValue('3.99');
    await user.clear(priceInput);
    await user.type(priceInput, '4.99');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update product')).toBeInTheDocument();
    });
  });

  test('handles network errors during save', async () => {
    const user = userEvent.setup();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    fetch
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockProducts) })
      .mockRejectedValueOnce(new Error('Network error'));

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    const priceInput = screen.getByDisplayValue('3.99');
    await user.clear(priceInput);
    await user.type(priceInput, '4.99');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Error updating product')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  test('handles fetch errors on initial load', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });

  test('displays table headers correctly', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Product')).toBeInTheDocument();
    });

    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('only one product can be edited at a time', async () => {
    const user = userEvent.setup();
    
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockProducts)
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('Edit');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    // Try to click another edit button - should be disabled or not shown
    const remainingEditButtons = screen.queryAllByText('Edit');
    expect(remainingEditButtons.length).toBe(mockProducts.length - 1);
  });
});
