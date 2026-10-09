"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthNavButtons() {
  return (
    <>
      <SignInButton mode="modal">
        <Button variant="outline">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button>Sign up</Button>
      </SignUpButton>
    </>
  );
}
