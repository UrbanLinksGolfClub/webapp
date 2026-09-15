"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type SignupState } from "./actions";

const initialState: SignupState = {};

const labelClass = "font-heading text-[9.5px] font-semibold tracking-[0.24em] text-ul-text-muted";
const inputClass =
  "mt-2 w-full border border-ul-cream-dark bg-ul-white px-4 py-3 text-ul-text focus:border-ul-green focus:outline-none";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  if (state.success) {
    return (
      <div className="w-full max-w-md bg-ul-white p-8 text-center">
        <h1 className="font-heading text-3xl text-ul-green">REQUEST RECEIVED</h1>
        <p className="mt-3 text-sm text-ul-text-muted">
          An admin will review your account and approve it before you can log in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-heading text-[10px] tracking-[0.18em] text-ul-green hover:text-ul-gold-dark"
        >
          BACK TO LOGIN
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-ul-white p-8">
      <h1 className="font-heading text-3xl leading-none text-ul-green">REQUEST ACCESS</h1>
      <p className="font-accent mt-2 text-lg italic text-ul-text-muted">
        Urban Links members only. New accounts require admin approval.
      </p>
      <div className="my-6 h-px bg-ul-cream-dark" />
      <form action={formAction} className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="name">
            FULL NAME
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            EMAIL
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">
            PHONE (OPTIONAL)
          </label>
          <input id="phone" name="phone" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">
            PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className={inputClass}
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
          {pending ? "SUBMITTING..." : "REQUEST ACCESS"}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between border-t border-ul-cream-dark pt-5">
        <span className="text-sm text-ul-text-muted">Already approved?</span>
        <Link
          href="/login"
          className="font-heading text-[10px] tracking-[0.18em] text-ul-green hover:text-ul-gold-dark"
        >
          LOG IN →
        </Link>
      </div>
    </div>
  );
}
