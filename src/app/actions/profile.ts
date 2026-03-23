import { prisma } from "@/lib/db";

export async function saveDoctorProfile(data: any) {
  return await prisma.profile.upsert({
    where: { userId: data.userId },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      specialty: data.specialty,
      documentUrl: data.documentUrl,
    },
    create: {
      userId: data.userId, 
      firstName: data.firstName,
      lastName: data.lastName,
      specialty: data.specialty,
      documentUrl: data.documentUrl,
    },
  });
}