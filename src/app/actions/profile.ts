"use server"
import { prisma as db } from '@/lib/db';

export async function saveDoctorProfile(data: any) {
  try {
    const existingProfile = await db.profile.findFirst({
      where: { userId: data.userId },
    });

    if (existingProfile) {
      throw new Error("Դուք արդեն ունեք ստեղծված պրոֆիլ:");
    }

    return await db.profile.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        specialty: data.specialty,
        documentUrl: data.documentUrl,
        user: {
          connect: { id: data.userId }
        }
      }
    });
  } catch (error: any) {
    console.error("Prisma error:", error);
    throw new Error(error.message || "Սխալ պրոֆիլը պահպանելիս");
  }
}