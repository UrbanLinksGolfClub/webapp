"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = {
  error?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  pending_approval:
    "Your account is awaiting admin approval. You'll be able to log in once approved.",
  suspended: "Your account has been suspended. Contact the club for help.",
  credentials: "Invalid email or password.",
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/club",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code ?? "credentials";
      return { error: ERROR_MESSAGES[code] ?? ERROR_MESSAGES.credentials };
    }
    throw error;
  }
}
