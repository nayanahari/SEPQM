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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const db_utils_1 = require("./db.utils");
const restaurant_model_1 = require("../../../src/models/restaurant.model");
const mongoose_1 = __importDefault(require("mongoose"));
test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_utils_1.connectMockDB)();
}));
test_1.test.afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_utils_1.clearMockDB)();
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_utils_1.closeMockDB)();
}));
// Inside your tests, generate valid ObjectIds:
const userId1 = new mongoose_1.default.Types.ObjectId();
const userId2 = new mongoose_1.default.Types.ObjectId();
(0, test_1.test)('should create a restaurant in the database', () => __awaiter(void 0, void 0, void 0, function* () {
    const newRestaurant = yield restaurant_model_1.Restaurant.create({
        name: 'Test Pizza Place',
        address: '123 Fake Street',
        location: 'Malabe',
        userId: userId1
    });
    (0, test_1.expect)(newRestaurant.name).toBe('Test Pizza Place');
    (0, test_1.expect)(newRestaurant.address).toBe('123 Fake Street');
}));
(0, test_1.test)('should retrieve all restaurants', () => __awaiter(void 0, void 0, void 0, function* () {
    yield restaurant_model_1.Restaurant.create([
        { name: 'A', address: '1st Street', location: 'Malabe', userId: userId1 },
        { name: 'B', address: '2nd Street', location: 'Malabe', userId: userId2 }
    ]);
    const restaurants = yield restaurant_model_1.Restaurant.find();
    (0, test_1.expect)(restaurants.length).toBe(2);
}));
(0, test_1.test)('should update a restaurant by ID', () => __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield restaurant_model_1.Restaurant.create({
        name: 'Old Name',
        address: 'Old Address',
        location: 'Malabe',
        userId: userId1
    });
    const updated = yield restaurant_model_1.Restaurant.findByIdAndUpdate(restaurant._id, { name: 'New Name' }, { new: true });
    (0, test_1.expect)(updated === null || updated === void 0 ? void 0 : updated.name).toBe('New Name');
}));
(0, test_1.test)('should delete a restaurant by ID', () => __awaiter(void 0, void 0, void 0, function* () {
    const restaurant = yield restaurant_model_1.Restaurant.create({
        name: 'To Be Deleted',
        address: 'Somewhere',
        location: 'Malabe',
        userId: userId1
    });
    yield restaurant_model_1.Restaurant.findByIdAndDelete(restaurant._id);
    const found = yield restaurant_model_1.Restaurant.findById(restaurant._id);
    (0, test_1.expect)(found).toBeNull();
}));
