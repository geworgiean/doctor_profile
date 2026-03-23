"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabase } from "../../lib/supabase";
import { saveDoctorProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";


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
          <div className="mb-6 inline-block p-4 bg-blue-50 rounded-full text-blue-600 text-4xl">
            🩺
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">MediProfile</h2>
          <p className="text-slate-500 mb-8">Խնդրում ենք մուտք գործել՝ ձեր բժշկական պրոֆիլը ստեղծելու և դիպլոմը ներկայացնելու համար:</p>
          <button 
            onClick={() => signIn("google")}
            className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
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
    const userId = session?.user?.id;

    try {
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
                    <input name="firstName" placeholder="Արման" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Ազգանուն</label>
                    <input name="lastName" placeholder="Գևորգյան" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white" />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Մասնագիտացում</label>
              <input name="specialty" placeholder="օր. Սիրտ-անոթային վիրաբույժ" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white" />
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
              <p className="text-xs text-slate-500 mt-2">Առավելագույն չափը՝ 10MB</p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Պահպանվում է...
                </>
              ) : (
                <>💾 Պահպանել Պրոֆիլը</>
              )}
            </button>
          </form>
          
        </div>
      </div>
    </main>
  );
}