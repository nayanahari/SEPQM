import { test, expect } from '@playwright/test';

test('Restaurant edit form - Cancel button should discard changes', async ({ page }) => {

  //navigate to login and perform login
  await page.goto('http://localhost:5173/login/restaurant');
  await page.fill('input[name="email"]', 'res2@gmail.com');
  await page.fill('input[name="password"]', 'resadmin');
  await page.click('button:has-text("Login")');
  await page.waitForURL(/\/restaurant-dash/);

  //verify restaurant info is displayed in read-only view
  await expect(page.locator('text="Test Bistro"').first()).toBeVisible();

  //navigate to edit form
  await page.click('button:has-text("Edit")');
  await page.waitForURL(/\/restaurant\/edit\//);

  //confirm input fields are pre-filled
  const nameInput = page.locator('input[name="name"]');
  const addressInput = page.locator('input[name="address"]');
  const locationInput = page.locator('input[name="location"]');

  await expect(nameInput).not.toBeEmpty();
  await expect(addressInput).not.toBeEmpty();
  await expect(locationInput).not.toBeEmpty();

  //store initial values to compare later
  const initialName = await nameInput.inputValue();
  const initialAddress = await addressInput.inputValue();
  const initialLocation = await locationInput.inputValue();

  //modify input fields (but do not save)
  await nameInput.fill('Temporary Change');
  await addressInput.fill('Temp Address');
  await locationInput.fill('Temp City');

  //click Cancel and verify navigation back to dashboard
  await page.locator('button:has-text("Cancel")').click();
  await page.waitForURL(/\/restaurant-dash/);

  //reopen edit form to confirm values are unchanged
  await page.click('button:has-text("Edit")');
  await page.waitForURL(/\/restaurant\/edit\//);

  await expect(nameInput).toHaveValue(initialName);
  await expect(addressInput).toHaveValue(initialAddress);
  await expect(locationInput).toHaveValue(initialLocation);
});
