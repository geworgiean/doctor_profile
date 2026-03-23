"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabase } from "../../lib/supabase";
import { saveDoctorProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-lg font-medium text-slate-600 animate-pulse">Բեռնվում է...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-sm border border-slate-100">
          <div className="mb-6 inline-block p-4 bg-blue-50 rounded-full text-blue-600 text-4xl">🩺</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">MediProfile</h2>
          <p className="text-slate-500 mb-8">Խնդրում ենք մուտք գործել՝ ձեր բժշկական պրոֆիլը ստեղծելու և դիպլոմը ներկայացնելու համար:</p>
          <button 
            onClick={() => signIn("google")}
            className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3"
          >
            Մուտք գործել Google-ով
          </button>
        </div>
      </div>
    );
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Խնդրում ենք ընտրել PDF ֆայլը");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const userId = (session?.user as any)?.id; 

    try {
      if (!userId) throw new Error("Օգտատիրոջ ID-ն բացակայում է: Փորձեք դուրս գալ և նորից մուտք գործել:");

      const fileName = `${userId}/diploma-${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('doctor-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('doctor-documents')
        .getPublicUrl(fileName);

      await saveDoctorProfile({
        userId,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        specialty: formData.get("specialty") as string,
        documentUrl: publicUrl,
      });

      alert("Պրոֆիլը հաջողությամբ պահպանվեց");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Սխալ տեղի ունեցավ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 md:px-10 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight italic">MediProfile</h1>
        <div className="flex items-center gap-4 border border-slate-100 bg-slate-50 px-4 py-2 rounded-full">
          <Link 
            href="/dashboard" 
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition px-2"
          >
            Իմ Պրոֆիլը
          </Link>
          <span className="text-slate-200">|</span>
          <p className="text-sm text-slate-700">Բարև, <span className="font-semibold">{session.user?.name}</span></p>
          <button 
            onClick={() => signOut()} 
            className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition"
          >
            Դուրս գալ
          </button>
        </div>
      </nav>

      <div className="grow w-full flex justify-center items-center p-4 md:p-10">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Լրացրեք պրոֆիլը</h2>
              <p className="text-slate-500 text-sm mt-1">Մուտքագրեք ձեր մասնագիտական տվյալները</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Անուն</label>
                    <input name="firstName" placeholder="Արման" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white text-slate-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ազգանուն</label>
                    <input name="lastName" placeholder="Գևորգյան" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white text-slate-900" />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Մասնագիտացում</label>
              <input name="specialty" placeholder="օր. Սիրտ-անոթային վիրաբույժ" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white text-slate-900" />
            </div>
            
            <div className="bg-slate-50 p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors group">
              <label className="block text-sm font-semibold text-slate-800 mb-2.5">Բժշկական դիպլոմ (PDF տարբերակ)</label>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                required 
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? "Պահպանվում է..." : "💾 Պահպանել Պրոֆիլը"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}