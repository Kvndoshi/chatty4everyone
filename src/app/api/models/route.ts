import { listModels } from "@/lib/server/llm";

export const runtime = "nodejs";
export const revalidate = 3600;

/** OpenRouter's public model catalogue, for the model picker. */
export async function GET() {
  try {
    return Response.json({ models: await listModels() });
  } catch {
    return Response.json({ models: [] });
  }
}
