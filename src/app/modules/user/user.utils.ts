import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

const findLastStudentId = async () => {
  const lastStudent = await User.findOne(
    {
      role: 'student',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({
      createdAt: -1,
    })
    .lean();

  return lastStudent?.id ? lastStudent.id : undefined;
};

// 2023 03 0001
export const generateStudentID = async (payload: TAcademicSemester | null) => {
  if (payload !== null) {
    let currentId = (0).toString(); // 0000 by default
    const lastStudentId = await findLastStudentId();
    const lastStudentSemesterCode = lastStudentId?.substring(4, 6);
    const lastStudentYear = lastStudentId?.substring(0, 4);
    const currentSemesterCode = payload.code;
    const currentYear = payload.year;
    if (
      lastStudentId &&
      lastStudentSemesterCode === currentSemesterCode &&
      lastStudentYear === currentYear
    ) {
      currentId = lastStudentId.substring(6);
    }
    const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
    const generatedId = `${payload.year}${payload.code}${incrementId}`;
    return generatedId;
  }
};