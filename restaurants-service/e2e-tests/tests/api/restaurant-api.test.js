"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const auth_1 = require("../../utils/auth");
test_1.test.describe("Restaurant API", () => {
    let token;
    let apiContext;
    let restaurantId;
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        token = yield (0, auth_1.getUserToken)();
        apiContext = yield test_1.request.newContext({
            baseURL: "http://localhost:3001",
            extraHTTPHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }));
    (0, test_1.test)("Create a restaurant", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield apiContext.post("/api/restaurants", {
            data: {
                name: "Test Bistro",
                address: "123 Food Lane",
                location: "Downtown",
            },
        });
        console.log("Final URL:", res.url());
        console.log("Create status:", res.status());
        console.log("Create body:", yield res.text());
        (0, test_1.expect)(res.ok()).toBeTruthy();
        const data = yield res.json();
        (0, test_1.expect)(data.name).toBe("Test Bistro");
        restaurantId = data._id;
    }));
    (0, test_1.test)("Get all restaurants", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield apiContext.get("/api/restaurants");
        console.log("Final URL:", res.url());
        console.log("Create status:", res.status());
        console.log("Create body:", yield res.text());
        (0, test_1.expect)(res.ok()).toBeTruthy();
        const restaurants = yield res.json();
        (0, test_1.expect)(Array.isArray(restaurants)).toBe(true);
    }));
    (0, test_1.test)("Get one restaurant by ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield apiContext.get(`/api/restaurants/${restaurantId}`);
        console.log("Get One status:", res.status());
        console.log("Get One body:", yield res.text());
        (0, test_1.expect)(res.ok()).toBeTruthy();
        const restaurant = yield res.json();
        (0, test_1.expect)(restaurant._id).toBe(restaurantId);
        (0, test_1.expect)(restaurant.name).toBe("Test Bistro");
    }));
    (0, test_1.test)("Update restaurant", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield apiContext.put(`/api/restaurants/${restaurantId}`, {
            data: {
                name: "Updated Bistro",
                address: "456 New Lane",
                location: "Uptown",
            },
        });
        console.log("Update status:", res.status());
        console.log("Update body:", yield res.text());
        (0, test_1.expect)(res.ok()).toBeTruthy();
        const updated = yield res.json();
        (0, test_1.expect)(updated.name).toBe("Updated Bistro");
    }));
    (0, test_1.test)("Delete restaurant", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield apiContext.delete(`/api/restaurants/${restaurantId}`);
        console.log("Delete status:", res.status());
        console.log("Delete body:", yield res.text());
        (0, test_1.expect)(res.status()).toBe(204); // No content
    }));
    // 🔒 Unauthorized Access Tests
    (0, test_1.test)("Fail to create restaurant without token", () => __awaiter(void 0, void 0, void 0, function* () {
        const unauthContext = yield test_1.request.newContext({
            baseURL: "http://localhost:3001",
        });
        const res = yield unauthContext.post("/api/restaurants", {
            data: {
                name: "NoAuth Bistro",
                address: "123 NoAuth",
                location: "Nowhere",
            },
        });
        (0, test_1.expect)(res.status()).toBe(401); // Unauthorized
    }));
    (0, test_1.test)("Fail to update restaurant without token", () => __awaiter(void 0, void 0, void 0, function* () {
        const unauthContext = yield test_1.request.newContext({
            baseURL: "http://localhost:3001",
        });
        const res = yield unauthContext.put(`/api/restaurants/${restaurantId}`, {
            data: {
                name: "Hacker Bistro",
            },
        });
        (0, test_1.expect)(res.status()).toBe(401); // Unauthorized
    }));
    (0, test_1.test)("Fail to delete restaurant without token", () => __awaiter(void 0, void 0, void 0, function* () {
        const unauthContext = yield test_1.request.newContext({
            baseURL: "http://localhost:3001",
        });
        const res = yield unauthContext.delete(`/api/restaurants/${restaurantId}`);
        (0, test_1.expect)(res.status()).toBe(401); // Unauthorized
    }));
});
