import { getServerSession } from "next-auth";
import { prisma as db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession();

  // 1. Եթե սեսիա չկա, ուղարկում ենք գլխավոր էջ
  if (!session || !session.user) {
    redirect("/");
  }

  // 2. Փորձում ենք ստանալ ID-ն տարբեր աղբյուրներից (Google-ի sub կամ database id)
  const userId = (session.user as any).id || (session.user as any).sub;

  try {
    // 3. Փնտրում ենք պրոֆիլը
    const profile = await db.profile.findFirst({
      where: { 
        userId: userId 
      },
    });

    // 4. Եթե պրոֆիլը չկա, ցույց ենք տալիս «Ստեղծել» կոճակը՝ քո դիզայնով
    if (!profile) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-600 mb-6 font-medium">
              Ձեր պրոֆիլը չի գտնվել այս ID-ով ({userId}):
            </p>
            <Link 
              href="/" 
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Վերադառնալ և Լրացնել
            </Link>
          </div>
        </div>
      );
    }

    // 5. Հաջողված դեպքում՝ քո հիմնական դիզայնը (image_744752.png)
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center">
        <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-10 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight italic">MediProfile</h1>
          <div className="flex items-center gap-4 border border-slate-100 bg-slate-50 px-4 py-2 rounded-full">
            <p className="text-sm text-slate-700">Բարև, <span className="font-semibold">{session.user.name}</span></p>
          </div>
        </nav>

        <div className="grow w-full flex justify-center items-center p-4 md:p-10">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Իմ Պրոֆիլը</h2>
              <p className="text-slate-500 text-sm mt-1">Ձեր պահպանված տվյալները</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Անուն</label>
                  <p className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                    {profile.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ազգանուն</label>
                  <p className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                    {profile.lastName}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Մասնագիտացում</label>
                <p className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                  {profile.specialty}
                </p>
              </div>
              
              <div className="pt-4">
                <a 
                  href={profile.documentUrl} 
                  target="_blank" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg active:scale-95 transition"
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
    console.error("Dashboard error:", error);
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Տեղի է ունեցել սխալ բազայի հետ կապ հաստատելիս:
      </div>
    );
  }
}