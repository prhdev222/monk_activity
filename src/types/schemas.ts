import { z } from "zod";

export const activityPayloadSchema = z.object({
  userId: z.string().cuid(),
  activityType: z.enum([
    "SITTING_MEDITATION",
    "CHANTING",
    "ALMS_WALK",
    "TEMPLE_WALK",
    "TEMPLE_SWEEPING",
    "TEMPLE_CHORES",
    "ARM_SWING",
    "WALKING_MEDITATION",
    "DRINK_PANA_ZERO_CAL",
  ]),
  date: z
    .union([z.string().datetime(), z.date()])
    .optional()
    .transform((v) => (v ? new Date(v as any) : undefined)),
  durationMin: z.number().int().min(0).optional(),
  intensity: z.string().min(1).max(50).optional(),
  caloriesBurned: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type ActivityPayload = z.infer<typeof activityPayloadSchema>;

export const smokingPayloadSchema = z.object({
  userId: z.string().cuid(),
  date: z.string().datetime().or(z.date()).transform((v) => new Date(v as any)),
  cigarettesCount: z.number().int().min(0),
  cravingLevel: z.number().int().min(0).max(10).optional(),
});

export type SmokingPayload = z.infer<typeof smokingPayloadSchema>;

export const userCreateSchema = z.object({
  phone: z.string().min(8).max(20),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  hn: z.string().optional(),
  monkName: z.string().min(1),
  templeName: z.string().optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  smokes: z.boolean().default(false),
  consentPdpa: z.literal(true, { errorMap: () => ({ message: "required" }) }),
});

export type UserCreatePayload = z.infer<typeof userCreateSchema>;


