"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow">
      <h1 className="font-bold text-xl">💬 ChatApp</h1>
      {session ? (
        <div className="flex items-center gap-3">
          <img
            src={session.user?.image ?? ""}
            alt="profile"
            className="w-8 h-8 rounded-full border"
          />
          <span>{session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("google")}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Sign In with Google
        </button>
      )}
    </nav>
  );
}
