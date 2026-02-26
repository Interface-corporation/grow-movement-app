

# Status Workflow System for Entrepreneurs and Coaches

## Overview

This plan implements a proper status lifecycle for both entrepreneurs and coaches, ensuring each status controls what actions are permitted and where profiles are visible throughout the system.

## Status Definitions

### Entrepreneur Statuses
| Status | Meaning |
|--------|---------|
| Pending | Applied via public form, awaiting admin review |
| Admitted | Accepted into program, visible on public homepage, available for matching |
| Matched | Paired with a coach, currently in the program |
| Alumni | Completed the program, visible but cannot be matched again |
| Rejected | Application denied, hidden everywhere |

### Coach Statuses
| Status | Meaning |
|--------|---------|
| Pending | Applied via public form, awaiting admin review |
| Accepted | Approved, can browse entrepreneurs and submit matching requests |
| Matched | Currently assigned to an entrepreneur, cannot be matched again |
| Unmatched | Previously matched, now available for new matching |
| Rejected | Application denied, hidden everywhere |

---

## Changes Required

### 1. Rename Existing Statuses (Database-safe via code)
- Entrepreneur: `In Training` becomes `Admitted` throughout the codebase
- Coach: `Active` becomes `Accepted`, add `Matched` and `Unmatched`
- No database migration needed -- statuses are stored as plain strings, so we just update the code and existing data via SQL updates

### 2. Public Coach Application Page
- Add a new route `/apply/coach` with a public application form (similar to the entrepreneur `/apply` page)
- The form collects: name, email, phone, organization, specialization, country, bio, experience, availability, preferred communication, preferred client type, LinkedIn
- Submits to the `coaches` table with `status: 'Pending'`
- Add a link to this form from the homepage/navbar

### 3. Update Admin Applications Page
- **Entrepreneur admit action**: sets status to `Admitted` (instead of `In Training`)
- **Coach admit action**: sets status to `Accepted` (instead of `Active`)
- Add status filter so admin can view Pending, Rejected, and re-admit rejected applications

### 4. Update Public Entrepreneurs Page
- Only show entrepreneurs with status `Admitted` (available for matching, not yet matched)
- Also show `Alumni` entrepreneurs but mark them clearly as alumni (not selectable for matching)
- Exclude `Matched` entrepreneurs from the browsable/selectable list (they are already paired)

### 5. Update Matching Request Flow (Cart System)
- Only allow adding entrepreneurs with status `Admitted` to cart (not Alumni, not Matched)
- Validate the requester's email against accepted coaches in the system (status = `Accepted` or `Unmatched`)
- Show an error if the email does not belong to an accepted/unmatched coach
- Limit selection to 3 entrepreneurs (already implemented)

### 6. Update Admin Matching Page
- When a match is created:
  - Set the entrepreneur's status to `Matched`
  - Set the coach's status to `Matched`
- Only show `Admitted` entrepreneurs (not Alumni) in the match creation dropdown
- Only show `Accepted` or `Unmatched` coaches in the match creation dropdown
- Add an "End Coaching / Complete" action on existing matches that:
  - Sets the entrepreneur's status to `Alumni`
  - Sets the coach's status to `Unmatched`
  - Marks the match as `completed`
- Add an "Unmatch" action that:
  - Sets the entrepreneur's status back to `Admitted`
  - Sets the coach's status to `Unmatched`
  - Marks the match as `cancelled`

### 7. Update Admin Entrepreneurs Page
- Change status dropdown options to: `Pending`, `Admitted`, `Matched`, `Alumni`, `Rejected`
- When admin creates an entrepreneur via dashboard, default status is `Admitted` (auto-admitted)

### 8. Update Admin Coaches Page
- Change status dropdown options to: `Pending`, `Accepted`, `Matched`, `Unmatched`, `Rejected`
- When admin creates a coach via dashboard, default status is `Accepted`

### 9. Update Matching Requests Admin Page
- Show the coach verification status (whether the requesting email belongs to an accepted coach)
- Display a badge indicating if the requester is a verified coach

---

## Technical Details

### Files to modify:
1. **`src/pages/Apply.tsx`** -- Change submitted status from `'Pending'` to `'Pending'` (already correct)
2. **New file: `src/pages/ApplyCoach.tsx`** -- Public coach application form
3. **`src/App.tsx`** -- Add `/apply/coach` route
4. **`src/components/Navbar.tsx`** -- Add coach application link
5. **`src/pages/admin/AdminApplications.tsx`** -- Change admit status to `Admitted`/`Accepted`, add status filter
6. **`src/pages/Entrepreneurs.tsx`** -- Filter to show only `Admitted` + `Alumni`, prevent adding Alumni to cart
7. **`src/pages/MatchingRequest.tsx`** -- Add coach email verification against `coaches` table
8. **`src/pages/admin/AdminMatching.tsx`** -- Update status on match create/delete/complete, filter dropdowns properly
9. **`src/pages/admin/AdminEntrepreneurs.tsx`** -- Update status options, default to `Admitted`
10. **`src/pages/admin/AdminCoaches.tsx`** -- Update status options, default to `Accepted`
11. **`src/pages/admin/AdminMatchingRequests.tsx`** -- Show coach verification badge
12. **`src/components/EntrepreneurCard.tsx`** -- Show Alumni badge, disable "add to cart" for Alumni

### Data migration (run via SQL):
```sql
-- Update existing entrepreneur statuses
UPDATE entrepreneurs SET status = 'Admitted' WHERE status = 'In Training';

-- Update existing coach statuses  
UPDATE coaches SET status = 'Accepted' WHERE status = 'Active';
UPDATE coaches SET status = 'Rejected' WHERE status = 'Inactive';
```

### No schema changes needed:
The `status` column on both tables is already a text/varchar field, so the new status values work without migration.

