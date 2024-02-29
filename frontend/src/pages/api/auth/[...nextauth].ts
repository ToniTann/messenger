import NextAuth, { Awaitable, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
type ExtendedUserType = User & { username?: string; uid?: string };
const prisma = new PrismaClient();
console.log('Hereeeeeeeeeeerrrrr')
export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token, user }) {
      
      return {...session , user:{...session.user , ...user}}
    },
  },
});

