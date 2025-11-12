import Navbar from "@/components/Navbar";
import ChatBox from "@/components/ChatBox";

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="p-4 max-w-2xl mx-auto">
        <ChatBox />
      </main>
    </div>
  );
}
