import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/");

  const profile = await db.profile.findFirst({
    where: { userId: (session.user as any).id },
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <p className="text-slate-600 mb-4">Դուք դեռ չունեք լրացված պրոֆիլ:</p>
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Լրացնել</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center italic">MediProfile</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Բժշկի տվյալներ</label>
            <p className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
              {profile.firstName} {profile.lastName}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Մասնագիտացում</label>
            <p className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
              {profile.specialty}
            </p>
          </div>
          
          <div className="pt-4">
            <a 
              href={profile.documentUrl} 
              target="_blank" 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              📄 Դիտել Դիպլոմը (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}