import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listEntrepreneursTool from "./tools/list-entrepreneurs";
import getEntrepreneurTool from "./tools/get-entrepreneur";
import listProgramsTool from "./tools/list-programs";
import listProjectsTool from "./tools/list-projects";
import listMatchingRequestsTool from "./tools/list-matching-requests";
import addProjectNoteTool from "./tools/add-project-note";

// The OAuth issuer must be the direct Supabase host, built from the project ref
// (inlined at build time by Vite, so this stays import-safe).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "grow-movement-app",
  title: "Grow Movement App",
  version: "0.1.0",
  instructions:
    "Tools for the Grow Movement platform. Read entrepreneurs, programs, coaching projects and matching requests, and add progress notes to projects. All calls run as the signed-in Grow Movement user, so results respect that user's access.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listEntrepreneursTool,
    getEntrepreneurTool,
    listProgramsTool,
    listProjectsTool,
    listMatchingRequestsTool,
    addProjectNoteTool,
  ],
});
