import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/");
  }

  try {
    const profile = await db.profile.findFirst({
      where: { 
        userId: (session.user as any).id 
      },
    });

    if (!profile) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center max-w-sm">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-600 mb-6 font-medium">
              Ձեր տվյալները դեռ բազայում չկան: Խնդրում ենք լրացնել պրոֆիլը:
            </p>
            <Link 
              href="/" 
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Լրացնել հիմա
            </Link>
          </div>
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center">
        <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-10 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight italic">
            MediProfile
          </Link>
          <div className="flex items-center gap-4 border border-slate-100 bg-slate-50 px-4 py-2 rounded-full">
            <p className="text-sm text-slate-700">
              Բարև, <span className="font-semibold">{session.user.name}</span>
            </p>
          </div>
        </nav>

        <div className="grow w-full flex justify-center items-center p-4 md:p-10">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100">
            <div className="border-b border-slate-100 pb-4 mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight italic">
                Իմ Պրոֆիլը
              </h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Բժշկի տվյալներ
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {profile.firstName} {profile.lastName}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Մասնագիտացում
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {profile.specialty}
                </div>
              </div>
              
              <div className="pt-4 text-center">
                <a 
                  href={profile.documentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  📄 Դիտել Դիպլոմը (PDF)
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );

  } catch (error) {
    console.error("Dashboard render error:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-6 rounded-xl shadow-md text-red-600 border border-red-100">
          Տեղի է ունեցել սխալ տվյալները բեռնելիս: Խնդրում ենք ստուգել բազայի կապը:
        </div>
      </div>
    );
  }
}