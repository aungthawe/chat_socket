"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";

export default function Navbar() {
  const { data: session } = useSession();
  const profileImage = session?.user?.image;

  const handleSignIn = async (provider: "google" | "github") => {
    await signIn(provider, { redirect: false });
    toast.success("Signed in successfully!");
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out successfully!");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white shadow">
      <h1 className="font-bold text-purple-600 text-2xl">ChatApp</h1>

      {session ? (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="bg-purple-600  text-white px-3 py-1 rounded-xl shadow-sm cursor-pointer"
          >
            Sign Out
          </button>
          <span> {session.user?.name}</span>
          <img
            src={profileImage}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <button
            onClick={() => handleSignIn("google")}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Sign In with Google
          </button>
          <button
            onClick={() => handleSignIn("github")}
            className="bg-purple-600  text-white px-3 py-1 rounded"
          >
            Sign In with GitHub
          </button>
        </div>
      )}
    </nav>
  );
}
