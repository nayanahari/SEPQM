"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    use: {
        baseURL: 'http://localhost:3001', // Your restaurant microservice base URL
        headless: true,
        ignoreHTTPSErrors: true,
    },
    timeout: 30000,
    testDir: './e2e-tests/tests',
    reporter: [['html', { open: 'always' }]],
});
