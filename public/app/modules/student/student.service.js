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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = require("../user/user.model");
const student_constant_1 = require("./student.constant");
const student_model_1 = require("./student.model");
const getAllStudentsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // const queryObj = { ...query }; // copy of original query
    // remove the given fields from excludeFields array
    // const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    // excludeFields.forEach((element) => delete queryObj[element]);
    // console.log({query: query}, {queryObj: queryObj});
    // Searching
    // const studentSearchableFields = ['email', 'name.firstName', 'presentAddress'];
    // let searchTerm = '';
    // if (query?.searchTerm) {
    //   searchTerm = query?.searchTerm as string;
    // }
    // const searchQuery = Student.find({
    //   $or: studentSearchableFields.map((field) => ({
    //     [field]: { $regex: searchTerm, $options: 'i' },
    //   })),
    // });
    // Filtering
    // const filterQuery = searchQuery.find(queryObj);
    // Sorting
    // let sort = '-createdAt';
    // if (query?.sort) {
    //   sort = query.sort as string;
    // }
    // const sortQuery = filterQuery.sort(sort);
    // Limiting
    // let limit = 1;
    // if (query?.limit) {
    //   limit = Number(query.limit);
    // }
    // const limitQuery = sortQuery.limit(limit);
    // Pagination
    // let page = 1;
    // let skip = 0;
    // if(query?.page){
    //   page = Number(query.page);
    //   skip = (page-1)*limit;
    // }
    // const paginateQuery = limitQuery.skip(skip);
    // Fields Limiting
    // let fields = '-__v'
    // if(query?.fields){
    //   fields = (query.fields as string).split(',').join(' ');
    //   console.log({fields});
    // }
    // const fieldLimitingQuery = paginateQuery.select(fields);
    // Returning Response
    // const result = await fieldLimitingQuery.populate('admissionSemester').populate({
    //   path: 'academicDepartment',
    //   populate: {
    //     path: 'academicFaculty',
    //   },
    // });
    // return result;
    const studentQuery = new QueryBuilder_1.default(student_model_1.Student.find()
        .populate('admissionSemester')
        .populate({
        path: 'academicDepartment',
        populate: {
            path: 'academicFaculty',
        },
    }), query)
        .search(student_constant_1.studentSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield studentQuery.modelQuery;
    return result;
});
const getSingleStudentFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield student_model_1.Student.findById({ id })
        .populate('admissionSemester')
        .populate({
        path: 'academicDepartment',
        populate: {
            path: 'academicFaculty',
        },
    });
    return result;
});
const deleteStudentFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction();
        const deletedStudent = yield student_model_1.Student.findByIdAndUpdate({ id }, { isDeleted: true }, { new: true, session });
        if (!deletedStudent) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete student');
        }
        const userId = deletedStudent.user;
        const deletedUser = yield user_model_1.User.findByIdAndUpdate({ userId }, { isDeleted: true }, { new: true, session });
        if (!deletedUser) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete user');
        }
        yield session.commitTransaction();
        yield session.endSession();
        return deletedStudent;
    }
    catch (err) {
        yield session.abortTransaction();
        yield session.endSession();
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete student');
    }
});
const updateStudentFromDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, guardian, localGuardian } = payload, remainingStudentData = __rest(payload, ["name", "guardian", "localGuardian"]);
    const modifiedUpdatedData = Object.assign({}, remainingStudentData);
    if (name && Object.keys(name).length) {
        for (const [key, value] of Object.entries(name)) {
            modifiedUpdatedData[`name.${key}`] = value;
        }
    }
    if (guardian && Object.keys(guardian).length) {
        for (const [key, value] of Object.entries(guardian)) {
            modifiedUpdatedData[`guardian.${key}`] = value;
        }
    }
    if (localGuardian && Object.keys(localGuardian).length) {
        for (const [key, value] of Object.entries(localGuardian)) {
            modifiedUpdatedData[`localGuardian.${key}`] = value;
        }
    }
    const result = yield student_model_1.Student.findByIdAndUpdate({ id }, modifiedUpdatedData, { new: true, runValidators: true });
    return result;
});
exports.StudentServices = {
    getAllStudentsFromDB,
    getSingleStudentFromDB,
    updateStudentFromDB,
    deleteStudentFromDB,
};
