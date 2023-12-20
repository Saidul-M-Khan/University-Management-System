import httpStatus from 'http-status';
import { startSession } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { studentSearchableFields } from './student.constant';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromDB = async (query: Record<string, unknown>) => {
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

  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('admissionSemester')
      .populate({
        path: 'academicDepartment',
        populate: {
          path: 'academicFaculty',
        },
      }),
    query,
  )
    .search(studentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await studentQuery.modelQuery;

  return result;
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findById({ id })
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const session = await startSession();

  try {
    session.startTransaction();

    const deletedStudent = await Student.findByIdAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }

    const userId = deletedStudent.user;

    const deletedUser = await User.findByIdAndUpdate(
      { userId },
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedStudent;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
  }
};

const updateStudentFromDB = async (id: string, payload: Partial<TStudent>) => {
  const { name, guardian, localGuardian, ...remainingStudentData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingStudentData,
  };

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

  const result = await Student.findByIdAndUpdate(
    { id },
    modifiedUpdatedData,
    { new: true, runValidators: true },
  );
  return result;
};

export const StudentServices = {
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  updateStudentFromDB,
  deleteStudentFromDB,
};
