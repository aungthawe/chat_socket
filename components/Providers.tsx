// components/Providers.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type Props = {
  children: React.ReactNode;
  session?: Session; // if you want to pass server session; optional
};

export default function Providers({ children, session }: Props) {
  // SessionProvider is a client component and must be inside a "use client" file.
  // We accept `session` as optional to support server-provided session hydration.
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
