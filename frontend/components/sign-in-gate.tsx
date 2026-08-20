"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Radio, ShieldCheck, Webhook, Zap } from "lucide-react";

export function SignInGate() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Webhook className="size-5" aria-hidden />
          </div>
          <span className="text-lg font-semibold tracking-tight">RelayBox</span>
        </div>

        <h1 className="mt-8 text-2xl font-semibold leading-tight tracking-tight text-balance">
          Inspect every webhook, the instant it lands.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Give any service a public URL and watch the raw requests stream in —
          headers, payloads, signatures, and timing, all in one place.
        </p>

        <ul className="mt-6 flex flex-col gap-3">
          <Feature icon={Zap} text="Real-time capture with zero setup" />
          <Feature icon={Radio} text="Full request detail — body, headers, and query" />
          <Feature icon={ShieldCheck} text="Private endpoints scoped to your account" />
        </ul>

        <div className="mt-8 flex flex-col gap-2.5">
          <SignInButton mode="modal">
            <button
              type="button"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in to your inbox
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Create an account
            </button>
          </SignUpButton>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By continuing you agree to inspect responsibly.
        </p>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-muted-foreground ring-1 ring-border">
        <Icon className="size-3.5" aria-hidden />
      </div>
      <span className="text-sm text-foreground">{text}</span>
    </li>
  );
}
