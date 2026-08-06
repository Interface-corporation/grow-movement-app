import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description:
    "List coaching projects, optionally filtered by program, status, coach or entrepreneur. Use this to see active engagements.",
  inputSchema: {
    program_id: z.string().optional().describe("Filter by program id (uuid)."),
    status: z.string().optional().describe("Filter by project status."),
    coach_id: z.string().optional().describe("Filter by coach id (uuid)."),
    entrepreneur_id: z.string().optional().describe("Filter by entrepreneur id (uuid)."),
    limit: z.number().int().optional().describe("Max rows to return (default 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ program_id, status, coach_id, entrepreneur_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 25, 1), 100);
    let query = supabaseForUser(ctx)
      .from("projects")
      .select(
        "id, name, description, status, program_id, coach_id, entrepreneur_id, match_id, created_at, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(take);

    if (program_id) query = query.eq("program_id", program_id);
    if (status) query = query.eq("status", status);
    if (coach_id) query = query.eq("coach_id", coach_id);
    if (entrepreneur_id) query = query.eq("entrepreneur_id", entrepreneur_id);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { count: data?.length ?? 0, projects: data ?? [] },
    };
  },
});
