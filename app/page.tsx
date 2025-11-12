"use client"
import Navbar from "@/components/Navbar";
import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <div>
      Hello 1
      <Navbar />
      <main className="p-4 max-w-2xl mx-auto">
        Hello 2
        <ChatBox />
      </main>
    </div>
  );
}
