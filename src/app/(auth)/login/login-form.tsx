"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/club";
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md bg-ul-white p-8">
      <h1 className="font-heading text-3xl leading-none text-ul-green">WELCOME BACK</h1>
      <p className="font-accent mt-2 text-lg italic text-ul-text-muted">
        Sign in with your email and password.
      </p>
      <div className="my-6 h-px bg-ul-cream-dark" />
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label
            className="font-heading text-[9.5px] font-semibold tracking-[0.24em] text-ul-text-muted"
            htmlFor="email"
          >
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-2 w-full border border-ul-cream-dark bg-ul-white px-4 py-3 text-ul-text focus:border-ul-green focus:outline-none"
          />
        </div>
        <div>
          <label
            className="font-heading text-[9.5px] font-semibold tracking-[0.24em] text-ul-text-muted"
            htmlFor="password"
          >
            PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-2 w-full border border-ul-cream-dark bg-ul-white px-4 py-3 text-ul-text focus:border-ul-green focus:outline-none"
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ul-green py-4 text-center font-heading text-xs tracking-[0.22em] text-ul-cream transition-colors hover:bg-ul-green-light disabled:opacity-50"
        >
          {pending ? "SIGNING IN..." : "ENTER THE CLUB"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between border-t border-ul-cream-dark pt-5">
        <span className="text-sm text-ul-text-muted">Not a member yet?</span>
        <Link
          href="/signup"
          className="font-heading text-[10px] tracking-[0.18em] text-ul-green hover:text-ul-gold-dark"
        >
          REQUEST ACCESS →
        </Link>
      </div>
    </div>
  );
}
