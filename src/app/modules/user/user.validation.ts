import { z } from 'zod';

const userValidationSchema = z.object({
  id: z.string(),
  password: z
    .string({
      invalid_type_error: 'Password must be string',
    })
    .max(20, { message: 'Password cannot be more than 20 characters' })
    .optional(),
  // status: z.enum(['in-progress', 'blocked']).default('in-progress'),
});

export const UserValidation = { userValidationSchema };
