import { test, expect, Page } from '@playwright/test';

//static test configuration
const testData = {
  admin: {
    email: 'res2@gmail.com',
    password: 'resadmin',
  },
  baseUrl: 'http://localhost:5173',
  loginUrl: '/login/restaurant',
  dashboardUrl: '/restaurant-dash',
};

//page Object for the login page
class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto(`${testData.baseUrl}${testData.loginUrl}`);
    await this.page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 5000 });
  }

  async fillCredentials(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
  }

  async submitForm() {
    console.log('Clicking login button...');
    await this.page.click('button:has-text("Login")');
  }

  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submitForm();
  }

  async captureLoginState() {
    const alert = this.page.locator('.alert, .error-message').first();
    if (await alert.isVisible()) {
      console.log('ALERT MESSAGE:', await alert.textContent());
    }

    const token = await this.page.evaluate(() => localStorage.getItem('token'));
    console.log('LocalStorage Token:', token);

    console.log('Current URL:', this.page.url());
  }
}

//page Object for the restaurant dashboard
class RestaurantDashboardPage {
  constructor(private page: Page) {}

  async navigateToDashboard() {
    await this.page.goto(`${testData.baseUrl}${testData.dashboardUrl}`);
    await this.page.waitForSelector('.text-3xl.font-bold', { state: 'visible', timeout: 10000 });
  }

  async getStoreStatus() {
    const statusElement = this.page.locator('[class*="inline-block font-semibold px-4 py-2 rounded-full"]');
    const statusText = await statusElement.textContent();
    return statusText?.includes('Open') ? 'open' : 'closed';
  }

  async toggleStoreStatus() {
    const toggle = this.page.locator('input[type="checkbox"]').first();
    await toggle.click();
    await this.page.waitForTimeout(1000); //wait for status change processing
  }

  async verifyStatusChangeNotification(expectedStatus: string) {
    const notification = this.page.locator('.swal2-title');
    await expect(notification).toHaveText('Success!');

    const content = this.page.locator('.swal2-content');
    await expect(content).toContainText(`Store is now ${expectedStatus}.`);

    await this.page.locator('.swal2-confirm').click(); //dismiss notification
  }
}

test.describe('Restaurant Admin Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: RestaurantDashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new RestaurantDashboardPage(page);
  });

  test('Successful login flow', async ({ page }) => {
    await page.context().tracing.start({ screenshots: true, snapshots: true });

    try {
      await loginPage.navigate();
      await loginPage.login(testData.admin.email, testData.admin.password);

      //wait for redirect to dashboard or an error alert
      await Promise.race([
        page.waitForURL(`**${testData.dashboardUrl}`, { timeout: 15000 }),
        page.waitForSelector('.alert, .error', { timeout: 5000 }),
      ]);

      const currentUrl = page.url();

      if (currentUrl.includes(testData.dashboardUrl)) {
        console.log('Successfully navigated to dashboard:', currentUrl);
      } else {
        const error = page.locator('.alert, .error').first();
        if (await error.isVisible()) {
          console.log('Error after login:', await error.textContent());
        } else {
          console.log('Login failed, but no visible error message.');
        }
        await loginPage.captureLoginState();
      }

      expect(currentUrl).toContain(testData.dashboardUrl);
    } catch (err) {
      console.error('Test failed:', err);
      await loginPage.captureLoginState();
      throw err;
    } finally {
      await page.context().tracing.stop({ path: 'trace.zip' });
    }
  });

  test.describe('Restaurant Store Status Toggle', () => {
    test.beforeEach(async ({ page }) => {
      //ensure user is logged in and dashboard is loaded
      await loginPage.navigate();
      await loginPage.login(testData.admin.email, testData.admin.password);
      await page.waitForURL(`**${testData.dashboardUrl}`, { timeout: 10000 });
      await dashboardPage.navigateToDashboard();
    });

    test('Toggle store status from open to closed', async ({ page }) => {
      const initialStatus = await dashboardPage.getStoreStatus();

      //proceed only if store is open
      if (initialStatus === 'open') {
        await dashboardPage.toggleStoreStatus();

        const newStatus = await dashboardPage.getStoreStatus();
        expect(newStatus).toBe('closed');

        await dashboardPage.verifyStatusChangeNotification('Closed');

        const toggle = page.locator('input[type="checkbox"]').first();
        await expect(toggle).not.toBeChecked();
      } else {
        console.log('Store was already closed.');
      }
    });
  });
});
