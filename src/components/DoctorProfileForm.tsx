"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { saveDoctorProfile } from "@/app/actions/profile";

export default function DoctorProfileForm({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Խնդրում ենք ընտրել PDF ֆայլը");

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const fileName = `diploma-${userId}-${Date.now()}.pdf`;
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

      alert("Պրոֆիլը հաջողությամբ պահպանվեց:");
    } catch (error) {
      console.error(error);
      alert("Սխալ տեղի ունեցավ վերբեռնման ժամանակ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Լրացնել Պրոֆիլը</h2>
      
      <form onSubmit={handleUpload} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Անուն</label>
          <input name="firstName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ազգանուն</label>
          <input name="lastName" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Մասնագիտացում</label>
          <input name="specialty" placeholder="օր. Ստոմատոլոգ" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
        </div>
        
        <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300">
          <label className="block text-sm font-medium text-slate-700 mb-2">Բժշկական դիպլոմ (PDF)</label>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 active:scale-95"
        >
          {loading ? "Մշակվում է..." : "Պահպանել Պրոֆիլը"}
        </button>
      </form>
    </div>
  );
}