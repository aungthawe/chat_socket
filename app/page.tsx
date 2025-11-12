import Navbar from "@/components/Navbar";
import ChatBox from "@/components/ChatBox";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <ChatBox />
      </main>
      <Toaster richColors position="top-center" />
    </>
  );
}
