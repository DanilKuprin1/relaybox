import { Show } from "@clerk/nextjs";
import { Dashboard } from "@/components/dashboard";
import { SignInGate } from "@/components/sign-in-gate";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <SignInGate />
      </Show>
      <Show when="signed-in">
        <Dashboard />
      </Show>
    </>
  );
}
