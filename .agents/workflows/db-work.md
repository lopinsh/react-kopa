---
description: Enforces the Service Law for all database-related work — schema changes, new queries, service methods, and Prisma migrations on "Ejam Kopā".
---

Step 1 — Orient

State the goal: new query, new service method, schema change, or migration?
Check /lib/services — does a relevant service already exist? Can it be extended rather than creating a new one?
Check docs/audit_report.md for any known DB or service layer issues.

Step 2 — Schema Changes (if applicable)
If modifying prisma/schema.prisma:

 Add the field/model/relation with correct types and nullability
 Run npx prisma migrate dev --name {descriptive-name} — never skip naming migrations
 Run npx prisma generate after every schema change
 Update any affected Prisma-generated types used in services or interfaces
 Check if the change requires seeding updates (prisma/seed.ts)

Migration naming convention:
add_{entity}_{field}
remove_{entity}_{field}
create_{entity}_table
add_{relation}_relation
Step 3 — Service Method Design
Every service method must follow this contract:
ts// /lib/services/{entity}Service.ts

async function getEntity(
  id: string,
  locale: string          // always accept locale
): Promise<EntityContext> // always return a typed context object, never raw Prisma result
{
  // 1. DB query via Prisma — only here, never in actions or components
  // 2. Permission/role resolution
  // 3. Localized metadata resolution
  // 4. Return unified context object
}
Context Object Shape
tstype EntityContext = {
  entity: EntityType;           // the core record
  userRole: Role | null;        // resolved membership/permission
  membershipStatus: Status;     // resolved status
  title: string;                // pre-resolved, locale-aware display title
  // ...any other pre-resolved metadata
}

Never return a raw Prisma object directly to a component or action
Never resolve locale-dependent data on the client
Never put permission logic in actions — it belongs in the service

Step 4 — Action → Service Contract
Verify the correct separation of concerns:
ResponsibilityAction ✅Service ✅Auth check (auth())✅❌Raw DB query (Prisma)❌✅Business / permission logic❌✅revalidatePath✅❌UI notification / toast✅❌Return ActionResponse<T>✅❌
If any of these are in the wrong layer — stop and refactor before continuing.
Step 5 — Type Safety

Use Prisma-generated types as the base (e.g., Prisma.GroupGetPayload<...>)
Extend with explicit interfaces where needed — never use any
If a type isn't generated yet, run prisma generate first

ts// Correct — derive from Prisma
type GroupWithMembers = Prisma.GroupGetPayload<{
  include: { members: true }
}>

// Wrong
type GroupWithMembers = any
Step 6 — Performance Considerations

Avoid N+1 queries — use include or select to fetch related data in one query
Use select over include when you don't need the full relation
For list views, always paginate — never findMany() without take and skip
For permission checks, prefer a single query that fetches both entity and membership

Step 7 — Verify

 No Prisma calls exist outside /lib/services
 All service methods accept locale and return a typed context object
 Migration named correctly and applied
 prisma generate run after any schema change
 No any types introduced
 Action/Service separation upheld


Hard Stops

Prisma call found in an action, component, or layout → move to service before continuing
Raw Prisma result returned directly to a component → wrap in context object first
any used for a Prisma type → derive proper type before continuing
Unnamed migration → rename before applying