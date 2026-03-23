"use server"
import { prisma as db } from '@/lib/db';

export async function saveDoctorProfile(data: any) {
  if (!data.userId) {
    throw new Error("User ID-ն գտնված չէ: Խնդրում ենք նորից մուտք գործել:");
  }

  try {
    return await db.profile.upsert({
      where: { 
        userId: data.userId 
      },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        specialty: data.specialty,
        documentUrl: data.documentUrl,
      },
      create: {
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