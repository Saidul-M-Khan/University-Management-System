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
exports.SemesterRegistrationService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const offeredCourse_model_1 = require("../offeredCourse/offeredCourse.model");
const academicSemester_model_1 = require("../academicSemester/academicSemester.model");
const semesterRegistration_model_1 = require("./semesterRegistration.model");
const semesterRegistration_constant_1 = require("./semesterRegistration.constant");
const mongoose_1 = require("mongoose");
const createSemesterRegistrationIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const academicSemester = payload === null || payload === void 0 ? void 0 : payload.academicSemester;
    // check if there is any registered semester that is already 'UPCOMING' or 'ONGOING'
    const isThereAnyUpcomingOrOngoingSemester = yield semesterRegistration_model_1.SemesterRegistration.findOne({
        $or: [{ status: 'UPCOMING' }, { status: 'ONGOING' }],
    });
    if (isThereAnyUpcomingOrOngoingSemester) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `There is already a ${isThereAnyUpcomingOrOngoingSemester.status} registered semester!`);
    }
    // check if semester exists
    const isAcademicSemesterExists = yield academicSemester_model_1.AcademicSemester.findById(academicSemester);
    if (!isAcademicSemesterExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This academic semester not found!');
    }
    // check if the semester is already registered!
    const isSemesterRegistrationExists = yield semesterRegistration_model_1.SemesterRegistration.findOne({
        academicSemester,
    });
    if (isSemesterRegistrationExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This semester is already registered!');
    }
    const result = yield semesterRegistration_model_1.SemesterRegistration.create(payload);
    return result;
});
const getAllSemesterRegistrationsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const semesterRegistrationQuery = new QueryBuilder_1.default(semesterRegistration_model_1.SemesterRegistration.find().populate('academicSemester'), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield semesterRegistrationQuery.modelQuery;
    return result;
});
const getSingleSemesterRegistrationsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield semesterRegistration_model_1.SemesterRegistration.findById(id);
    return result;
});
const updateSemesterRegistrationIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // /**
    //  * Step1: Check if the semester is exist
    //  * Step2: Check if the requested registered semester is exists
    //  * Step3: If the requested semester registration is ended, we will not update anything
    //  * Step4: If the requested semester registration is 'UPCOMING', we will let update everything.
    //  * Step5: If the requested semester registration is 'ONGOING', we will not update anything  except status to 'ENDED'
    //  * Step6: If the requested semester registration is 'ENDED' , we will not update anything
    //  *
    //  * UPCOMING --> ONGOING --> ENDED
    //  *
    //  */
    // check if the requested registered semester is exists
    // check if the semester is already registered!
    const isSemesterRegistrationExists = yield semesterRegistration_model_1.SemesterRegistration.findById(id);
    if (!isSemesterRegistrationExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This semester is not found !');
    }
    //if the requested semester registration is ended , we will not update anything
    const currentSemesterStatus = isSemesterRegistrationExists === null || isSemesterRegistrationExists === void 0 ? void 0 : isSemesterRegistrationExists.status;
    const requestedStatus = payload === null || payload === void 0 ? void 0 : payload.status;
    if (currentSemesterStatus === semesterRegistration_constant_1.RegistrationStatus.ENDED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `This semester is already ${currentSemesterStatus}`);
    }
    // UPCOMING --> ONGOING --> ENDED
    if (currentSemesterStatus === semesterRegistration_constant_1.RegistrationStatus.UPCOMING &&
        requestedStatus === semesterRegistration_constant_1.RegistrationStatus.ENDED) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `You can not directly change status from ${currentSemesterStatus} to ${requestedStatus}`);
    }
    if (currentSemesterStatus === semesterRegistration_constant_1.RegistrationStatus.ONGOING &&
        requestedStatus === semesterRegistration_constant_1.RegistrationStatus.UPCOMING) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `You can not directly change status from ${currentSemesterStatus} to ${requestedStatus}`);
    }
    const result = yield semesterRegistration_model_1.SemesterRegistration.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteSemesterRegistrationFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    /**
    * Step1: Delete associated offered courses.
    * Step2: Delete semester registration when the status is 'UPCOMING'.
    **/
    // checking if the semester registration is exist
    const isSemesterRegistrationExists = yield semesterRegistration_model_1.SemesterRegistration.findById(id);
    if (!isSemesterRegistrationExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This registered semester is not found !');
    }
    // checking if the status is still "UPCOMING"
    const semesterRegistrationStatus = isSemesterRegistrationExists.status;
    if (semesterRegistrationStatus !== 'UPCOMING') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `You can not update as the registered semester is ${semesterRegistrationStatus}`);
    }
    const session = yield (0, mongoose_1.startSession)();
    //deleting associated offered courses
    try {
        session.startTransaction();
        const deletedOfferedCourse = yield offeredCourse_model_1.OfferedCourse.deleteMany({
            semesterRegistration: id,
        }, {
            session,
        });
        if (!deletedOfferedCourse) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete semester registration !');
        }
        const deletedSemesterRegistration = yield semesterRegistration_model_1.SemesterRegistration.findByIdAndDelete(id, {
            session,
            new: true,
        });
        if (!deletedSemesterRegistration) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to delete semester registration !');
        }
        yield session.commitTransaction();
        yield session.endSession();
        return null;
    }
    catch (err) {
        yield session.abortTransaction();
        yield session.endSession();
        throw new Error(err);
    }
});
exports.SemesterRegistrationService = {
    createSemesterRegistrationIntoDB,
    getAllSemesterRegistrationsFromDB,
    getSingleSemesterRegistrationsFromDB,
    updateSemesterRegistrationIntoDB,
    deleteSemesterRegistrationFromDB,
};
