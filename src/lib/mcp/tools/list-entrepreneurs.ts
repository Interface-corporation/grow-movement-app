import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_entrepreneurs",
  title: "List entrepreneurs",
  description:
    "List entrepreneurs in the Grow Movement platform, optionally filtered by country, sector, status or a free-text search on name/business.",
  inputSchema: {
    search: z.string().optional().describe("Free-text match on entrepreneur or business name."),
    country: z.string().optional().describe("Filter by country."),
    sector: z.string().optional().describe("Filter by sector."),
    status: z.string().optional().describe("Filter by status, e.g. Active or Seed Fund Candidate."),
    limit: z.number().int().optional().describe("Max rows to return (default 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, country, sector, status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 25, 1), 100);
    let query = supabaseForUser(ctx)
      .from("entrepreneurs")
      .select(
        "id, name, business_name, country, sector, stage, status, program_id, pitch_summary, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(take);

    if (country) query = query.ilike("country", country);
    if (sector) query = query.ilike("sector", sector);
    if (status) query = query.eq("status", status);
    if (search) query = query.or(`name.ilike.%${search}%,business_name.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { count: data?.length ?? 0, entrepreneurs: data ?? [] },
    };
  },
});
