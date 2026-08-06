import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_project_note",
  title: "Add project note",
  description:
    "Add a progress/tracking note to a coaching project. The note is recorded against the signed-in user.",
  inputSchema: {
    project_id: z.string().describe("Project id (uuid) to attach the note to."),
    note: z.string().trim().describe("The note text."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ project_id, note }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    if (!note) {
      return { content: [{ type: "text", text: "Note text is required" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("project_track_notes")
      .insert({ project_id, note, author_id: ctx.getUserId() })
      .select("id, project_id, note, created_at")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Note added to project ${project_id}.` }],
      structuredContent: { note: data },
    };
  },
});
