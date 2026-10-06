import { z } from 'zod'

const email = z.email('Enter a valid email address')
const newPassword = z.string().min(8, 'Use at least 8 characters')
const personName = z.string().trim().min(2, 'Enter your full name')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: personName,
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Enter a workspace name')
    .max(60, 'Keep it under 60 characters'),
  email,
  password: newPassword,
})
export type RegisterValues = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const acceptInviteSchema = z
  .object({
    name: personName,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>
