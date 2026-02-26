

# Implementation Plan: Grow Movement System Enhancements

## Summary of Issues and Features to Implement

After thoroughly reviewing the codebase, here are the specific gaps identified and the changes needed:

---

## 1. Program Assignment for Entrepreneurs and Coaches (Admin)

**Current state:** Entrepreneurs have a `program_id` column but the admin form in `AdminEntrepreneurs.tsx` does not expose a program dropdown. Coaches are assigned to programs via the `program_coaches` junction table, but there is no UI in `AdminCoaches.tsx` to assign them to programs.

**Changes:**
- **`AdminEntrepreneurs.tsx`**: Add a program dropdown to the entrepreneur create/edit form. Fetch programs list and include `program_id` in the save payload.
- **`AdminCoaches.tsx`**: Add a program multi-select or dropdown. On save, insert/update rows in `program_coaches` table to link the coach to selected programs. Fetch existing program assignments when editing.

---

## 2. Program Admin Visibility of Assigned Coaches, Entrepreneurs, and Projects

**Current state:** `ProgramAdminDashboard.tsx` shows counts but no lists. `AdminProgramDetail.tsx` shows entrepreneurs filtered by `program_id` and coaches via `program_coaches`, but only the admin can access it.

**Changes:**
- **`ProgramAdminDashboard.tsx`**: Enhance to show lists of assigned entrepreneurs, coaches, and projects (not just counts). Add a link to the program detail page.
- **`AdminEntrepreneurs.tsx`**: Add program_admin filtering -- when `userRole === 'program_admin'`, filter entrepreneurs by `program_id`.
- **`AdminCoaches.tsx`**: When `userRole === 'program_admin'`, filter coaches via `program_coaches` for their program.
- **`AdminLayout.tsx`**: Give `program_admin` access to the Entrepreneurs and Coaches sidebar links.

---

## 3. Fix Track Notes (Project Notes System)

**Current state:** The code in `AdminProjects.tsx` and `AdminProgramDetail.tsx` inserts into `project_track_notes` with `author_id: user?.id` and queries with a join to `profiles:author_id(full_name)`. The issue is likely an RLS policy blocking inserts, or the `profiles` join failing because `author_id` references `auth.users` but the join expects a `profiles` table with matching foreign key.

**Changes:**
- Check and fix the `project_track_notes` table's RLS policies to allow authenticated users to insert and select.
- Verify the join `profiles:author_id(full_name)` works. The `profiles` table has `user_id` as the reference column, not `id` matching `author_id`. The foreign key may be missing. We need to either:
  - Add a foreign key from `project_track_notes.author_id` to `profiles.user_id`, OR
  - Change the query to manually resolve author names.
- Ensure the note author's name displays correctly using `profiles.full_name`.

**Database migration needed:**
```sql
-- Add foreign key if missing (or fix the join approach in code)
-- Also ensure RLS allows insert/select for authenticated users
```

---

## 4. Resource Access for Coaches in a Program

**Current state:** `AdminResources.tsx` fetches all resources without filtering by program. Coaches should only see public resources plus private resources belonging to their assigned program(s).

**Changes:**
- **`AdminResources.tsx`**: When `userRole === 'coach'`, filter resources to show:
  - All resources with `visibility = 'public'`
  - Private resources where `program_id` matches one of the coach's assigned programs (fetched via `program_coaches`)
- When `userRole === 'program_admin'`, filter private resources to their `programId` only.

---

## 5. Admin Match Status Control (Complete, Unmatch, Cancel)

**Current state:** `AdminMatching.tsx` already has `handleEndCoaching` (sets match to completed, entrepreneur to Alumni, coach to Unmatched) and `handleUnmatch` (sets match to cancelled, entrepreneur to Admitted, coach to Unmatched). These work correctly.

**Changes needed for sync:**
- **`AdminProgramDetail.tsx`**: Add match status control buttons (End Coaching, Unmatch) to the matches listed within a program. Currently only projects are shown; add a Matches section with status actions.
- **Coach dashboard matching view**: Coaches viewing matches should see the status but not be able to change it (read-only). Ensure the `AdminMatching.tsx` page for coaches shows matches filtered to their `coach_id` without edit controls.
- **Match status sync in projects**: When a match is completed/cancelled from `AdminMatching.tsx`, the associated project status should optionally be updated too (or at minimum, the project detail should reflect the current match status).

---

## 6. Charts for Coach and Program Admin Dashboards

**Current state:** `CoachDashboard.tsx` and `ProgramAdminDashboard.tsx` show stat cards with numbers only, no charts. The main `DashboardHome.tsx` has bar/pie charts using recharts.

**Changes:**
- **`CoachDashboard.tsx`**: Add a bar chart showing matches by status (Active/Completed) and a pie chart for project status distribution. Import recharts components.
- **`ProgramAdminDashboard.tsx`**: Add a bar chart showing entrepreneurs/coaches/matches/projects counts, and a pie chart for project status distribution. Fetch project status breakdown.

---

## 7. DashboardHome Stats Refinement

**Current state:** Shows total counts for entrepreneurs, coaches, requests, matches.

**Changes:**
- Add program and project counts to the stat cards.
- Show 6 stat cards instead of 4.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AdminEntrepreneurs.tsx` | Add program dropdown, program_admin filtering |
| `src/pages/admin/AdminCoaches.tsx` | Add program assignment dropdown, program_admin filtering |
| `src/pages/admin/AdminLayout.tsx` | Give program_admin access to Entrepreneurs/Coaches links |
| `src/pages/admin/ProgramAdminDashboard.tsx` | Add charts, lists of assigned entities |
| `src/pages/admin/CoachDashboard.tsx` | Add charts for stats |
| `src/pages/admin/DashboardHome.tsx` | Add program/project stat cards |
| `src/pages/admin/AdminProjects.tsx` | Fix track notes join/RLS |
| `src/pages/admin/AdminProgramDetail.tsx` | Add matches section with status controls, fix track notes |
| `src/pages/admin/AdminResources.tsx` | Filter resources by role/program for coaches |
| `src/pages/admin/AdminMatching.tsx` | Filter for coach role (read-only view of their matches) |

## Database Changes Needed

1. **RLS policy for `project_track_notes`**: Ensure INSERT and SELECT policies exist for authenticated users
2. **Foreign key check**: Verify `project_track_notes.author_id` can join to `profiles` -- may need to adjust the query approach if FK doesn't exist

## Technical Notes

- All charts use `recharts` (already installed)
- Program assignment for coaches uses the existing `program_coaches` junction table
- Entrepreneur program assignment uses the existing `entrepreneurs.program_id` column
- No new database tables needed
- Match status workflow (active -> completed/cancelled) already exists in AdminMatching; needs to be replicated in program detail view

