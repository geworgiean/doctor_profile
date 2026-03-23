"use client";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { supabase } from "../../lib/supabase";
import { saveDoctorProfile } from "@/app/actions/profile";

export default function Home() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Եթե սեսիան դեռ ստուգվում է
  if (status === "loading") return <p className="p-10">Բեռնվում է...</p>;

  // Եթե մարդը Login չի եղել
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Շարունակելու համար մուտք գործեք</p>
        <button 
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow"
        >
          Մուտք գործել Google-ով
        </button>
      </div>
    );
  }

  // Ֆորմայի ուղարկումը
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Ընտրեք ֆայլը");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const userId = session.user.id; // Վերցնում ենք ID-ն սեսիայից

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
      alert("Սխալ տեղի ունեցավ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-10">
        <p>Բարև, <b>{session.user?.name}</b></p>
        <button onClick={() => signOut()} className="text-red-500 text-sm underline">Դուրս գալ</button>
      </div>

      <form onSubmit={handleUpload} className="flex flex-col gap-4 border p-6 rounded shadow-sm">
        <h2 className="text-xl font-bold">Լրացրեք պրոֆիլը</h2>
        <input name="firstName" placeholder="Անուն" required className="border p-2 rounded" />
        <input name="lastName" placeholder="Ազգանուն" required className="border p-2 rounded" />
        <input name="specialty" placeholder="Մասնագիտացում" required className="border p-2 rounded" />
        
        <label className="text-sm text-gray-600">Բժշկական դիպլոմ (PDF)</label>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          required 
        />

        <button 
          type="submit" 
          disabled={loading} 
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Պահպանվում է..." : "Պահպանել"}
        </button>
      </form>
    </main>
  );
}