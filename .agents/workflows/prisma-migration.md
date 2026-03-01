---
description: How to run Prisma migrations safely
---
1. **Stop the local development server**.
// turbo
2. Run the migration command:
`npx prisma migrate dev`
3. **Regenerate the Prisma client**:
`npx prisma generate`
4. Restart the development server:
`npm run dev`
