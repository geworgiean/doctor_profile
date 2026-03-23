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
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
            <p className="text-slate-600 mb-4">Պրոֆիլը գտնված չէ:</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
              Ստեղծել հիմա
            </Link>
          </div>
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center">
        <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center shadow-sm">
          <h1 className="text-2xl font-bold text-blue-600 italic">MediProfile</h1>
          <div className="bg-slate-50 px-4 py-2 rounded-full border">
            <span className="text-sm font-medium">Բարև, {session.user.name}</span>
          </div>
        </nav>

        <div className="grow w-full flex justify-center items-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-2">Իմ Տվյալները</h2>
            <div className="space-y-4">
              <p><strong>Անուն Ազգանուն:</strong> {profile.firstName} {profile.lastName}</p>
              <p><strong>Մասնագիտացում:</strong> {profile.specialty}</p>
              <a href={profile.documentUrl} target="_blank" className="block text-center bg-slate-900 text-white py-3 rounded-xl mt-4">
                📄 Դիտել Դիպլոմը
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Dashboard Error:", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 bg-red-50 text-red-600 rounded-lg">
          Բազայի սխալ (P2025): Օգտատերը չի գտնվել բազայում:
        </div>
      </div>
    );
  }
}