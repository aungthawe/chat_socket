import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    name: string;
    email: string;
  }
}
