import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials:any) => { 
        if (credentials.username) {
          return {
            username: credentials.username,
            fullName: credentials.fullName,
            id: credentials._id,
            role: credentials.role,
            profilePic: credentials.profilePic,
          };
        } else {
          throw new CredentialsSignin({ cause: "Invalid credentials" });
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { 
        token.id = user.id;
        token.email = (user as any).username;
        token.fullName = (user as any).fullName;
        token.picture = (user as any).profilePic;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) { 
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).user.fullName = token.fullName;
        (session as any).user.email = token.email;
        session.user.image = token.picture;
        (session as any).user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
