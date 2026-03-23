import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) redirect("/");

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-slate-100 max-w-sm">
          <p className="text-slate-600 mb-6">Դուք դեռ չունեք ստեղծված պրոֆիլ։</p>
          <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Լրացնել հիմա
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold">Բժշկի Պրոֆիլ</h1>
          <p className="opacity-80 mt-2">Ձեր մասնագիտական տվյալները</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Անուն</label>
              <p className="text-lg font-semibold text-slate-800 border-b pb-1">{profile.firstName}</p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Ազգանուն</label>
              <p className="text-lg font-semibold text-slate-800 border-b pb-1">{profile.lastName}</p>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-bold">Մասնագիտացում</label>
            <p className="text-lg font-semibold text-slate-800 border-b pb-1">{profile.specialty}</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-700">Բժշկական դիպլոմ</p>
              <p className="text-sm text-slate-500">Վերբեռնված PDF ֆայլ</p>
            </div>
            <a 
              href={profile.documentUrl} 
              target="_blank" 
              className="bg-white border border-blue-600 text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              👁️ Դիտել
            </a>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 flex justify-between items-center border-t">
            <a href="/" className="text-sm text-slate-500 hover:text-blue-600 transition underline">Խմբագրել (Շուտով)</a>
            <p className="text-xs text-slate-400 font-mono">ID: {profile.userId}</p>
        </div>
      </div>
    </main>
  );
}