import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) redirect("/");

  // Քաշում ենք բժշկի պրոֆիլը բազայից
  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-600 mb-4">Դուք դեռ չունեք ստեղծված պրոֆիլ:</p>
        <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Լրացնել հիմա</a>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Իմ Պրոֆիլը</h1>
        
        <div className="space-y-4">
          <div className="border-b pb-2">
            <span className="text-sm text-slate-500">Անուն Ազգանուն</span>
            <p className="text-lg font-medium">{profile.firstName} {profile.lastName}</p>
          </div>
          
          <div className="border-b pb-2">
            <span className="text-sm text-slate-500">Մասնագիտացում</span>
            <p className="text-lg font-medium">{profile.specialty}</p>
          </div>

          <div className="pt-4">
            <a 
              href={profile.documentUrl} 
              target="_blank" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-black transition"
            >
              📄 Դիտել Դիպլոմը (PDF)
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}