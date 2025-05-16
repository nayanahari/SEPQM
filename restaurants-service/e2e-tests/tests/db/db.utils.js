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
exports.clearMockDB = exports.closeMockDB = exports.connectMockDB = void 0;
// db.test.ts
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer;
const connectMockDB = () => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    yield mongoose_1.default.connect(uri);
});
exports.connectMockDB = connectMockDB;
const closeMockDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.dropDatabase();
    yield mongoose_1.default.connection.close();
    yield mongoServer.stop();
});
exports.closeMockDB = closeMockDB;
const clearMockDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        yield collections[key].deleteMany({});
    }
});
exports.clearMockDB = clearMockDB;
