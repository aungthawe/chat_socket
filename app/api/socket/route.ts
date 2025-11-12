// app/api/socket/route.ts
import { Server } from "socket.io";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  // NOTE: Only works if you attach to Next.js server adapter
  return NextResponse.json({ message: "Socket endpoint (use server adapter)" });
};

// For dev/testing, you often run a separate Node server:
// node server.js with Socket.IO listening
