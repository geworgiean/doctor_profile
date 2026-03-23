"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { saveDoctorProfile } from "@/app/actions/profile";

export default function DoctorProfileForm({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Ընտրեք ֆայլը");

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

      alert("Պրոֆիլը հաջողությամբ ստեղծվեց");
    } catch (error) {
      console.error(error);
      alert("Սխալ վերբեռնման ժամանակ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4 max-w-sm p-4 border rounded shadow">
      <h2 className="text-lg font-bold">Լրացնել տվյալները</h2>
      <input name="firstName" placeholder="Անուն" required className="border p-2" />
      <input name="lastName" placeholder="Ազգանուն" required className="border p-2" />
      <input name="specialty" placeholder="Մասնագիտացում" required className="border p-2" />
      
      <label className="text-xs">Բժշկական դիպլոմ (PDF)</label>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        required 
      />

      <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded">
        {loading ? "Մշակվում է..." : "Պահպանել"}
      </button>
    </form>
  );
}