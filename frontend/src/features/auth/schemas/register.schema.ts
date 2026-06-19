import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
      "Password must contain at least one letter, one number, and one special character",
    ),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
