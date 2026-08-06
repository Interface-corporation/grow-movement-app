import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_programs",
  title: "List programs",
  description: "List Grow Movement coaching programs with their status and description.",
  inputSchema: {
    status: z.string().optional().describe("Filter by program status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("programs")
      .select("id, name, description, status, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { count: data?.length ?? 0, programs: data ?? [] },
    };
  },
});
