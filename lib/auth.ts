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
    async signIn({ user, account, profile }) {
      // Use Google's sub (subject identifier) as the consistent user ID
      // profile.sub is the stable Google user ID
      const googleId = (profile as { sub?: string })?.sub;

      if (account?.provider === "google" && user.email && googleId) {
        try {
          const existingProfile = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, googleId),
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
              .where(eq(userProfiles.id, googleId));
          } else {
            // Create new profile using Google's sub as primary key
            await db.insert(userProfiles).values({
              id: googleId,
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
    async jwt({ token, account, profile }) {
      // Use Google's sub (profile.sub) as the user ID - it's consistent across logins
      if (account && profile) {
        token.id = (profile as { sub?: string })?.sub;
        token.accessToken = account.access_token;
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
