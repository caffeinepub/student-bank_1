# Specification

## Summary
**Goal:** Fix the admin login flow so that calling `adminLogin` correctly assigns the admin role without errors, and the frontend properly handles the result.

**Planned changes:**
- Fix backend `adminLogin` logic in `main.mo` so it correctly assigns the admin role to the caller's principal without throwing an error
- Fix the frontend admin login flow in `App.tsx` so that after Internet Identity authentication, `adminLogin` is called correctly, errors are caught and displayed to the user, and on success the user is redirected to the admin dashboard

**User-visible outcome:** Admins can log in via Internet Identity and are successfully granted the admin role and redirected to the admin dashboard; any login errors are clearly shown on the login page instead of silently failing.
