import { test, expect } from "@playwright/test";

test("Delete restaurant with SweetAlert confirmation", async ({ page }) => {
  const config = {
    baseUrl: "http://localhost:5173",
    loginUrl: "/login/restaurant",
    adminEmail: "res2@gmail.com",
    adminPassword: "resadmin",
  };

  //navigate to login page and perform login
  await page.goto(`${config.baseUrl}${config.loginUrl}`);
  await page.fill('input[name="email"]', config.adminEmail);
  await page.fill('input[name="password"]', config.adminPassword);
  await page.click('button:has-text("Login")');
  await page.waitForURL(/\/restaurant-dash/);

  //verify the restaurant
  const restaurantName = page.locator('text="Test Bistro"').first();
  await expect(restaurantName).toBeVisible();

  const deleteButton = page.locator('button:has-text("Delete")');
  await deleteButton.click();

  //wait for SweetAlert confirmation modal to appear
  await page.waitForSelector(".swal2-modal", {
    state: "visible",
    timeout: 10000,
  });

  //verify modal
  const swalModal = page.locator(".swal2-modal");
  await expect(swalModal).toBeVisible();
  await expect(swalModal.locator(".swal2-title")).toHaveText("Are you sure?");
  await expect(swalModal.locator(".swal2-html-container")).toContainText(
    "delete your restaurant"
  );
});
