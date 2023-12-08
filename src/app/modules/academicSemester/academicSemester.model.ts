import { Schema, model } from 'mongoose';
import {
  AcademicSemesterCode,
  AcademicSemesterName,
  Months,
} from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';

// Partial<TAcademicSemester>

const academicSemesterSchema = new Schema<TAcademicSemester>(
  {
    name: {
      type: String,
      required: true,
      enum: AcademicSemesterName,
    },
    year: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      enum: AcademicSemesterCode,
    },
    startMonth: {
      type: String,
      required: true,
      enum: Months,
    },
    endMonth: {
      type: String,
      required: true,
      enum: Months,
    },
  },
  {
    timestamps: true,
  },
);

academicSemesterSchema.pre('save', async function(next){
  const isSemesterExists = await AcademicSemester.findOne({
    name: this.name,
    year: this.year,
  })
  if(isSemesterExists){
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Semester is already exists!',
    )
  }
  next()
})

export const AcademicSemester = model<TAcademicSemester>('AcademicSemester', academicSemesterSchema)