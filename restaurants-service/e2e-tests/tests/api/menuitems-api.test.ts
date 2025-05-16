import { test, expect, request } from "@playwright/test";
import { getUserToken } from "../../utils/auth";

const BASE_URL = "http://localhost:3001/api";

test.describe("Menu Items API Tests", () => {
  let token: string;
  let restaurantId = "6814567e23d29e610672b38e"; // Replace this with an actual restaurant ID from your DB
  let createdItemId: string;

  test.beforeAll(async () => {
    token = await getUserToken();
  });

  // ✅ VALID: Add Menu Item
  test("✅ should add a valid menu item", async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/restaurants/${restaurantId}/menu-items`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: "Burger",
          description: "Juicy grilled burger",
          price: 8.99,
          category: "Fast Food",
        },
      }
    );

    expect(response.status()).toBe(200);
    const item = await response.json();
    expect(item.name).toBe("Burger");
    createdItemId = item._id;
  });

    // ❌ INVALID: Unauthorized request
  test('❌ should fail to add a menu item without auth', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/restaurants/${restaurantId}/menu-items`, {
      data: {
        name: 'Unauthorized Pizza',
        description: 'Should fail',
        price: 10,
        category: 'Pizza',
      },
    });

    expect(response.status()).toBe(401);
  });

  // ✅ VALID: Get menu items by restaurant ID
  test('✅ should list menu items for a restaurant', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/restaurants/${restaurantId}/menu-items`);
    expect(response.status()).toBe(200);

    const items = await response.json();
    expect(Array.isArray(items)).toBeTruthy();
  });

  // ✅ VALID: Get menu item by ID
  test('✅ should get one menu item by ID', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/restaurants/${restaurantId}/menu-items/${createdItemId}`);
    expect(response.status()).toBe(200);

    const item = await response.json();
    expect(item._id).toBe(createdItemId);
  });

  // ❌ INVALID: Get non-existing menu item
  test('❌ should return 404 for non-existing menu item', async ({ request }) => {
    const fakeId = '662dd2f1e2f1b5b2d4a3e9c9'; // Use a valid ObjectId format but not in DB
    const response = await request.get(`${BASE_URL}/restaurants/${restaurantId}/menu-items/${fakeId}`);
    expect(response.status()).toBe(404);
  });

  // ✅ VALID: Update menu item
  test('✅ should update an existing menu item', async ({ request }) => {
    const response = await request.put(`${BASE_URL}/restaurants/${restaurantId}/menu-items/${createdItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: 'Updated Burger',
        price: 9.5,
      },
    });

    expect(response.status()).toBe(200);
    const item = await response.json();
    expect(item.name).toBe('Updated Burger');
  });

  // ❌ INVALID: Update with wrong ID
  test('❌ should return 404 for updating non-existing item', async ({ request }) => {
    const fakeId = '662dd2f1e2f1b5b2d4a3e9c9';
    const response = await request.put(`${BASE_URL}/restaurants/${restaurantId}/menu-items/${fakeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: 'Should Not Work',
      },
    });

    expect(response.status()).toBe(404);
  });

  // ✅ VALID: Delete menu item
  test('✅ should delete a menu item', async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/restaurants/${restaurantId}/menu-items/${createdItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(204);
  });

  // ❌ INVALID: Delete already deleted item
  test('❌ should return 404 when deleting non-existing item', async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/restaurants/${restaurantId}/menu-items/${createdItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(404);
  });

});
