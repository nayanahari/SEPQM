import { test, expect, Page } from "@playwright/test";

// Configuration and test credentials
const testData = {
  admin: {
    email: "nayanahari@gmail.com",
    password: "resadmin",
  },
  baseUrl: "http://localhost:5173",
  loginUrl: "/login/restaurant",
  dashboardUrl: "/restaurant-dash",
};

class LoginPage {
  constructor(private page: Page) {}

  // Navigate to the login page
  async navigate() {
    await this.page.goto(`${testData.baseUrl}${testData.loginUrl}`);
    await this.page.waitForSelector('input[name="email"]', {
      state: "visible",
      timeout: 5000,
    });
  }

  // Fill login form with credentials
  async fillCredentials(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
  }

  // Submit the login form
  async submitForm() {
    await this.page.click('button:has-text("Login")');
  }

  // Complete login sequence
  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submitForm();
  }

  //debugging helper to log state after failed login
  async captureLoginState() {
    const alert = this.page.locator(".alert, .error-message").first();
    if (await alert.isVisible()) {
      console.log("Login error message:", await alert.textContent());
    }

    const token = await this.page.evaluate(() => localStorage.getItem("token"));
    console.log("Token in localStorage:", token);

    console.log("Current URL:", this.page.url());
  }
}

test.describe("Restaurant Admin Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("Successful login flow", async ({ page }) => {
    await page.context().tracing.start({ screenshots: true, snapshots: true });

    try {
      await loginPage.login(testData.admin.email, testData.admin.password);

      //wait for dashboard URL or error alert
      await Promise.race([
        page.waitForURL(`**${testData.dashboardUrl}`, { timeout: 15000 }),
        page.waitForSelector(".alert, .error", { timeout: 5000 }),
      ]);

      const currentUrl = page.url();
      if (currentUrl.includes(testData.dashboardUrl)) {
        console.log("Navigation successful:", currentUrl);
      } else {
        const error = page.locator(".alert, .error").first();
        if (await error.isVisible()) {
          console.log("Login error:", await error.textContent());
        } else {
          console.log("Login failed without visible error.");
        }
        await loginPage.captureLoginState();
      }

      expect(currentUrl).toContain(testData.dashboardUrl);
    } catch (err) {
      await loginPage.captureLoginState();
      throw err;
    } finally {
      await page.context().tracing.stop({ path: "trace.zip" });
    }
  });

  test("Should not login with invalid credentials", async ({ page }) => {
    const invalidEmail = "invaliduser@example.com";
    const invalidPassword = "wrongpassword";

    await loginPage.login(invalidEmail, invalidPassword);

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    expect(currentUrl).not.toContain(testData.dashboardUrl);

    const possibleError = page.locator(
      ".alert, .error-message, .toast, .notification"
    );
    const hasError = await possibleError.count();

    if (hasError > 0) {
      await expect(possibleError.first()).toBeVisible({ timeout: 5000 });
    } else {
      console.warn("Visibility check.");
    }

    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
  });
});
