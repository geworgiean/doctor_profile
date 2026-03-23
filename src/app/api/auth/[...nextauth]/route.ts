import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma), // Սա կստեղծի User-ին բազայում ավտոմատ
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id; // Սա կտա բազայի իսկական ID-ն
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };