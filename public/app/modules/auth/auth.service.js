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
exports.AuthServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the user exists
    const user = yield user_model_1.User.isUserExistsByCustomId(payload.id);
    console.log(user);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid User ID');
    }
    // check if the user is already deleted
    const isDeleted = yield user_model_1.User.isUserDeletedByCustomId(user);
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted');
    }
    // check if the user is blocked
    const userStatus = yield user_model_1.User.userStatusByCustomId(user);
    if (userStatus === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked');
    }
    // checking if the password is correct
    const isPasswordMatched = yield user_model_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password not matched');
    }
    // create token and send to the client
    const jwtPayload = { userId: user.id, role: user.role };
    const jwtSecret = config_1.default.jwt_access_secret;
    const jwtConfig = { expiresIn: '10d' };
    const accessToken = jsonwebtoken_1.default.sign(jwtPayload, jwtSecret, jwtConfig);
    return {
        accessToken,
        needsPasswordChange: user === null || user === void 0 ? void 0 : user.needsPasswordChange,
    };
});
const changePasswordFromDB = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the user exists
    console.log(userData);
    const user = yield user_model_1.User.isUserExistsByCustomId(userData.userId);
    console.log(user);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid User ID');
    }
    // check if the user is already deleted
    const isDeleted = yield user_model_1.User.isUserDeletedByCustomId(user);
    if (isDeleted) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is deleted');
    }
    // check if the user is blocked
    const userStatus = yield user_model_1.User.userStatusByCustomId(user);
    if (userStatus === 'blocked') {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'User is blocked');
    }
    // checking if the password is correct
    const isPasswordMatched = yield user_model_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password not matched');
    }
    // hash new password
    const newHashedPassword = yield bcrypt_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield user_model_1.User.findOneAndUpdate({
        id: userData.userId,
        role: userData.role,
    }, {
        password: newHashedPassword,
        needsPasswordChange: false,
        passwordChangedAt: new Date(),
    });
    return null;
});
exports.AuthServices = {
    loginUser,
    changePasswordFromDB,
};
