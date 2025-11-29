const apiMock = require('@ng-apimock/core');
const devInterface = require('@ng-apimock/dev-interface');
const express = require('express');
const app = express();

// Get app name from command line argument or use default
const appName = process.argv[2] || 'demo-shop';
console.log(`Starting mock server for ${appName}`);

app.set('port', 9999);

/**
 * Configure ng-apimock processor
 * Docs: https://ngapimock.org/docs/installation#processor
 */
apiMock.processor.process({
  src: 'mock-server/mocks',
  patterns: {
    mocks: `${appName}/mocks/**/*.mock.json`,
    presets: `${appName}/presets/**/*.preset.json`,
  },
  watch: true, // Auto-reload on file changes
});

// Register middleware
app.use(apiMock.middleware);
app.use('/dev-interface', express.static(devInterface));

app.listen(app.get('port'), () => {
  console.log(`\n🚀 Mock server running on http://localhost:${app.get('port')}`);
  console.log(`📊 Dev interface: http://localhost:${app.get('port')}/dev-interface\n`);
  console.log(`Available endpoints:`);
  console.log(`  - GET    /api/products`);
  console.log(`  - GET    /api/products/:id`);
  console.log(`  - GET    /api/products/categories/all`);
  console.log(`  - PUT    /api/products/:id`);
  console.log(`  - POST   /api/orders\n`);
});
