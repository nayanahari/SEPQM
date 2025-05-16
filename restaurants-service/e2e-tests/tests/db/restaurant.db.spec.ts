import { test, expect } from '@playwright/test';
import { connectMockDB, closeMockDB, clearMockDB } from './db.utils';
import { Restaurant } from '../../../src/models/restaurant.model';
import mongoose from 'mongoose';

test.beforeAll(async () => {
  await connectMockDB();
});

test.afterEach(async () => {
  await clearMockDB();
});

test.afterAll(async () => {
  await closeMockDB();
});

// Inside your tests, generate valid ObjectIds:
const userId1 = new mongoose.Types.ObjectId();
const userId2 = new mongoose.Types.ObjectId();

test('✅ should create a restaurant in the database', async () => {
  const newRestaurant = await Restaurant.create({
    name: 'Test Pizza Place',
    address: '123 Fake Street',
    location: 'Malabe',
    userId: userId1
  });

  expect(newRestaurant.name).toBe('Test Pizza Place');
  expect(newRestaurant.address).toBe('123 Fake Street');
});

test('✅ should retrieve all restaurants', async () => {
  await Restaurant.create([
    { name: 'A', address: '1st Street', location: 'Malabe', userId: userId1 },
    { name: 'B', address: '2nd Street', location: 'Malabe', userId: userId2 }
  ]);

  const restaurants = await Restaurant.find();
  expect(restaurants.length).toBe(2);
});

test('✅ should update a restaurant by ID', async () => {
  const restaurant = await Restaurant.create({
    name: 'Old Name',
    address: 'Old Address',
    location: 'Malabe',
    userId: userId1
  });

  const updated = await Restaurant.findByIdAndUpdate(
    restaurant._id,
    { name: 'New Name' },
    { new: true }
  );

  expect(updated?.name).toBe('New Name');
});

test('✅ should delete a restaurant by ID', async () => {
  const restaurant = await Restaurant.create({
    name: 'To Be Deleted',
    address: 'Somewhere',
    location: 'Malabe',
    userId: userId1
  });

  await Restaurant.findByIdAndDelete(restaurant._id);
  const found = await Restaurant.findById(restaurant._id);
  expect(found).toBeNull();
});

test('❌ should return null when updating non-existent restaurant', async () => {
  const fakeId = new mongoose.Types.ObjectId();
  const result = await Restaurant.findByIdAndUpdate(fakeId, { name: 'Ghost' }, { new: true });
  expect(result).toBeNull();
});

test('❌ should not create restaurant with missing name', async () => {
  let error: any = null;
  try {
    await Restaurant.create({
      address: 'No Name Street',
      location: 'Colombo',
      userId: userId1
    });
  } catch (err) {
    error = err;
  }

  expect(error).not.toBeNull();
  expect(error.name).toBe('ValidationError');
});

test('❌ should not create restaurant with invalid userId type', async () => {
  let error: any = null;
  try {
    await Restaurant.create({
      name: 'Invalid UserId',
      address: 'Random Street',
      location: 'Colombo',
      userId: 'not-an-object-id'
    });
  } catch (err) {
    error = err;
  }

  expect(error).not.toBeNull();
});

