import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";

class PendingApprovalError extends CredentialsSignin {
  code = "pending_approval";
}

class SuspendedError extends CredentialsSignin {
  code = "suspended";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const member = await prisma.member.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!member) return null;

        const valid = await bcrypt.compare(password, member.passwordHash);
        if (!valid) return null;

        if (member.status === "PENDING") throw new PendingApprovalError();
        if (member.status === "SUSPENDED") throw new SuspendedError();

        return {
          id: member.id,
          email: member.email,
          name: member.name,
          role: member.role,
        };
      },
    }),
  ],
});
