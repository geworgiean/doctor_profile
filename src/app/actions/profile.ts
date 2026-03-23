"use server"
import { prisma as db } from '@/lib/db';

export async function saveDoctorProfile(data: any) {
  try {
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
  } catch (error) {
    console.error("Prisma error:", error);
    throw error;
  }
}