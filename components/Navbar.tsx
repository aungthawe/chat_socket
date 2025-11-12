"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow">
      <h1 className="font-bold text-xl">ChatApp</h1>

      {session ? (
        <div className="flex items-center gap-3">
          <span>{session.user?.name}</span>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex gap-3 items-center justify-end">
          <button
            onClick={() => signIn("google")}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Sign In with Google
          </button>
          <button
            onClick={() => signIn("github")}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            Sign In with GitHub
          </button>
        </div>
      )}
    </nav>
  );
}
