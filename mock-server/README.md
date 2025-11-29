# Mock Server Documentation

## Overview

This mock server uses **ng-apimock** to simulate all backend API endpoints for the demo shop. It allows frontend development and testing without requiring a live MongoDB instance or Node.js backend.

## Quick Start

### Start the Mock Server

```bash
npm run mock-server
```

The server will start on `http://localhost:9999`

### Access the Dev Interface

Open your browser to:
```
http://localhost:9999/dev-interface
```

This web interface allows you to:
- View all available mocks
- Switch between response scenarios
- Apply preset configurations
- Reset to default states

## Available Endpoints

### Products

| Method | Endpoint | Mock Name | Description |
|--------|----------|-----------|-------------|
| GET | `/api/products` | getProducts | Get all products |
| GET | `/api/products/:id` | getProductById | Get single product by ID |
| GET | `/api/products/categories/all` | getCategories | Get all categories |
| PUT | `/api/products/:id` | updateProduct | Update product (admin) |

### Orders

| Method | Endpoint | Mock Name | Description |
|--------|----------|-----------|-------------|
| POST | `/api/orders` | createOrder | Create new order |

## Response Scenarios

Each endpoint supports multiple scenarios for testing different conditions:

### getProducts
- `success` ⭐ (default) - Returns list of 10 products
- `empty` - Returns empty array
- `slow` - 3-second delay before response
- `unauthorized` - 401 error
- `serverError` - 500 error

### getProductById
- `success` ⭐ (default) - Returns product details
- `notFound` - 404 Product not found
- `invalidId` - 400 Invalid ID format
- `serverError` - 500 error

### getCategories
- `success` ⭐ (default) - Returns array of categories
- `empty` - Returns empty array
- `serverError` - 500 error

### updateProduct
- `success` ⭐ (default) - Returns updated product
- `notFound` - 404 Product not found
- `validationError` - 400 Validation failed
- `unauthorized` - 401 Unauthorized
- `serverError` - 500 error

### createOrder
- `success` ⭐ (default) - 201 Order created
- `slow` - 2-second delay before success
- `validationError` - 400 Validation failed
- `emptyCart` - 400 Cart is empty
- `outOfStock` - 409 Items out of stock
- `paymentFailed` - 402 Payment processing failed
- `serverError` - 500 error

## Presets

Presets configure multiple mocks at once for common testing scenarios:

### happy-path
All endpoints return successful responses
```bash
# Via Dev Interface: Click "Presets" > Select "happyPath" > Apply
```

### error-scenarios
All endpoints return error responses
```bash
# Via Dev Interface: Click "Presets" > Select "errorScenarios" > Apply
```

### slow-network
Simulates slow network conditions
```bash
# Via Dev Interface: Click "Presets" > Select "slowNetwork" > Apply
```

### empty-store
Simulates empty/new store state
```bash
# Via Dev Interface: Click "Presets" > Select "emptyStore" > Apply
```

### validation-errors
All mutation endpoints return validation errors
```bash
# Via Dev Interface: Click "Presets" > Select "validationErrors" > Apply
```

## Frontend Configuration

### React (Create React App)

The frontend is already configured to proxy to the mock server when running in development mode.

**Option 1: Use Mock Server Instead of Backend**

1. Start mock server: `npm run mock-server`
2. Update `frontend/package.json` proxy to point to mock server:
   ```json
   {
     "proxy": "http://localhost:9999"
   }
   ```
3. Start frontend: `cd frontend && npm start`

**Option 2: Keep Backend, Access Mock Server Directly**

Access mock server on a different port and make requests to `http://localhost:9999/api/*`

## Using in Tests

### Manual Testing

1. Start mock server: `npm run mock-server`
2. Open dev interface: http://localhost:9999/dev-interface
3. Select scenarios for each endpoint
4. Test your frontend manually
5. Switch scenarios to test different states

### Automated Testing (Future)

When ready to add E2E tests with Playwright:

1. Create `tests/utils/mocker.js` (see main guide)
2. Configure Playwright to start mock server
3. Use mocker utility in tests to control scenarios

Example:
```javascript
test('handles server error', async ({ page }) => {
  await mocker.selectScenario('getProducts', 'serverError');
  await page.goto('/shop');
  await expect(page.locator('.error-message')).toBeVisible();
});
```

## Directory Structure

```
mock-server/
├── mock-server.js                        # Server entry point
└── mocks/
    └── demo-shop/
        ├── mocks/
        │   ├── products/
        │   │   ├── get-products/
        │   │   │   ├── get-products.mock.json
        │   │   │   └── products-list.json
        │   │   ├── get-product-by-id/
        │   │   │   ├── get-product-by-id.mock.json
        │   │   │   └── product-detail.json
        │   │   ├── get-categories/
        │   │   │   └── get-categories.mock.json
        │   │   └── update-product/
        │   │       ├── update-product.mock.json
        │   │       └── updated-product.json
        │   └── orders/
        │       └── create-order/
        │           ├── create-order.mock.json
        │           └── created-order.json
        └── presets/
            ├── happy-path.preset.json
            ├── error-scenarios.preset.json
            ├── slow-network.preset.json
            ├── empty-store.preset.json
            └── validation-errors.preset.json
```

## Common Use Cases

### Testing Error Handling

1. Open dev interface
2. Select `serverError` scenario for `getProducts`
3. Reload your app
4. Verify error message displays correctly

### Testing Loading States

1. Open dev interface
2. Select `slow` scenario for `getProducts`
3. Navigate to shop page
4. Verify loading spinner appears

### Testing Empty States

1. Open dev interface
2. Apply `emptyStore` preset
3. Navigate through app
4. Verify empty state messages

### Testing Validation

1. Open dev interface
2. Select `validationError` scenario for `createOrder`
3. Try to place an order
4. Verify validation errors display

## Troubleshooting

### Mock Server Won't Start

**Error**: `Cannot find module '@ng-apimock/core'`
- **Solution**: Run `npm install` in root directory

**Error**: `Port 9999 already in use`
- **Solution**: Change port in `mock-server.js` line 9

### Scenarios Not Changing

**Issue**: Dev interface shows scenario selected but frontend still gets default
- **Solution**: Clear browser cookies and reload
- **Check**: Verify frontend is proxying to mock server (port 9999)

### Frontend Gets Real Backend

**Issue**: Changes in mock server don't affect frontend
- **Solution**: Check `frontend/package.json` proxy configuration
- **Verify**: Backend is not running on port 5001

## Tips

1. **Always check dev interface** - It shows exactly which scenarios are active
2. **Use presets for quick setup** - Don't manually configure each mock
3. **Watch mode is enabled** - Changes to mock files auto-reload
4. **Reset to defaults** - Click "Reset" in dev interface to restore all defaults
5. **Keep mock data realistic** - Use MongoDB-like IDs and proper timestamps

## Next Steps

- [ ] Add more product variations to `products-list.json`
- [ ] Create additional presets for specific test scenarios
- [ ] Add Playwright tests using the mocker utility
- [ ] Document team-specific testing workflows
- [ ] Create mock scenarios for authentication (future feature)

## Resources

- [ng-apimock Documentation](https://ngapimock.org/)
- [Mock Server Guide](../NG-APIMOCK-SETUP-GUIDE.md)
- [Express.js Documentation](https://expressjs.com/)
