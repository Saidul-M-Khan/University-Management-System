"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const userValidationSchema = zod_1.z.object({
    id: zod_1.z.string(),
    password: zod_1.z
        .string({
        invalid_type_error: 'Password must be string',
    })
        .max(20, { message: 'Password cannot be more than 20 characters' })
        .optional(),
    // status: z.enum(['in-progress', 'blocked']).default('in-progress'),
});
exports.UserValidation = { userValidationSchema };
