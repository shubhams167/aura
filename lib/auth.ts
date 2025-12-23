import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Store or update user profile in database on sign-in
      if (account?.provider === "google" && user.email && user.id) {
        try {
          const existingProfile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, user.id),
          });

          if (existingProfile) {
            // Update existing profile
            await db
              .update(userProfiles)
              .set({
                name: user.name,
                image: user.image,
                email: user.email,
              })
              .where(eq(userProfiles.id, user.id));
          } else {
            // Create new profile using NextAuth user.id as primary key
            await db.insert(userProfiles).values({
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            });
          }
        } catch (error) {
          console.error("Error saving user profile:", error);
          // Don't block sign-in if profile save fails
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = user?.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
