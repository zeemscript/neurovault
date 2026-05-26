import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const activityReportSchema = z.object({
  events: z.array(
    z.object({
      ai_tool_id: z.string(),
      url: z.string().url(),
      page_title: z.string().optional(),
      duration_secs: z.number().optional(),
      event_type: z.enum(["visit", "paste", "upload", "download"]),
      timestamp: z.string().datetime(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
  ),
});

export const policySchema = z.object({
  ai_tool_id: z.string().nullable().optional(),
  category: z
    .enum([
      "llm",
      "image-gen",
      "code",
      "search",
      "writing",
      "ml-platform",
      "productivity",
    ])
    .nullable()
    .optional(),
  action: z.enum(["monitor", "warn", "block"]),
  reason: z.string().nullable().optional(),
  enabled: z.boolean().default(true),
});

export const enrollmentSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const createEnrollmentLinkSchema = z.object({
  label: z.string().optional(),
  maxUses: z.number().positive().optional(),
  expiresInDays: z.number().positive().max(365).optional(),
});

export const bulkInviteSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(500),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ActivityReportInput = z.infer<typeof activityReportSchema>;
export type PolicyInput = z.infer<typeof policySchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
