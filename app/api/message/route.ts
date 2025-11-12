// app/api/messages/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.message.findMany({
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(messages);
}
