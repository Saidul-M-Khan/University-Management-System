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
exports.generateAdminId = exports.findLastAdminId = exports.generateFacultyId = exports.findLastFacultyId = exports.generateStudentID = void 0;
const user_model_1 = require("./user.model");
// Student ID
const findLastStudentId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastStudent = yield user_model_1.User.findOne({
        role: 'student',
    }, {
        id: 1,
        _id: 0,
    })
        .sort({
        createdAt: -1,
    })
        .lean();
    return (lastStudent === null || lastStudent === void 0 ? void 0 : lastStudent.id) ? lastStudent.id : undefined;
});
const generateStudentID = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload !== null) {
        let currentId = (0).toString(); // 0000 by default
        const lastStudentId = yield findLastStudentId();
        const lastStudentSemesterCode = lastStudentId === null || lastStudentId === void 0 ? void 0 : lastStudentId.substring(4, 6);
        const lastStudentYear = lastStudentId === null || lastStudentId === void 0 ? void 0 : lastStudentId.substring(0, 4);
        const currentSemesterCode = payload.code;
        const currentYear = payload.year;
        if (lastStudentId &&
            lastStudentSemesterCode === currentSemesterCode &&
            lastStudentYear === currentYear) {
            currentId = lastStudentId.substring(6);
        }
        const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
        const generatedId = `${payload.year}${payload.code}${incrementId}`;
        return generatedId;
    }
});
exports.generateStudentID = generateStudentID;
// Faculty ID
const findLastFacultyId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastFaculty = yield user_model_1.User.findOne({
        role: 'faculty',
    }, {
        id: 1,
        _id: 0,
    })
        .sort({
        createdAt: -1,
    })
        .lean();
    return (lastFaculty === null || lastFaculty === void 0 ? void 0 : lastFaculty.id) ? lastFaculty.id.substring(2) : undefined;
});
exports.findLastFacultyId = findLastFacultyId;
const generateFacultyId = () => __awaiter(void 0, void 0, void 0, function* () {
    let currentId = (0).toString();
    const lastFacultyId = yield (0, exports.findLastFacultyId)();
    if (lastFacultyId) {
        currentId = lastFacultyId.substring(2);
    }
    const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
    const generatedId = `F-${incrementId}`;
    return generatedId;
});
exports.generateFacultyId = generateFacultyId;
// Admin ID
const findLastAdminId = () => __awaiter(void 0, void 0, void 0, function* () {
    const lastAdmin = yield user_model_1.User.findOne({
        role: 'admin',
    }, {
        id: 1,
        _id: 0,
    })
        .sort({
        createdAt: -1,
    })
        .lean();
    return (lastAdmin === null || lastAdmin === void 0 ? void 0 : lastAdmin.id) ? lastAdmin.id.substring(2) : undefined;
});
exports.findLastAdminId = findLastAdminId;
const generateAdminId = () => __awaiter(void 0, void 0, void 0, function* () {
    let currentId = (0).toString();
    const lastAdminId = yield (0, exports.findLastAdminId)();
    if (lastAdminId) {
        currentId = lastAdminId.substring(2);
    }
    const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
    const generatedId = `A-${incrementId}`;
    return generatedId;
});
exports.generateAdminId = generateAdminId;
