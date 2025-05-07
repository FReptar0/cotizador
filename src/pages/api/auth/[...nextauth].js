// src/pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  // 1) Los providers que quieres usar
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // 2) Usamos JWT para sesiones ligeras
  session: { strategy: "jwt" },

  // 3) Callbacks para enriquecer el token y la sesión
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.id = profile.sub;
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      return session;
    },
  },
});
