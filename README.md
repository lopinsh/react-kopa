# Ejam Kopā (Let's Go Together)

**Ejam Kopā** is a Latvian community platform designed to minimize friction for creating groups and local events. It is a specialized tool for fostering hyper-local connections and managing community activities within Latvia.

## 🎯 Project Scope
The platform provides a centralized hub for community-driven interactions, offering robust support for discovery, membership management, and real-time event coordination.

## 🏗 Architectural Pillars
The codebase follows a strict internal architecture to ensure scalability and ease of maintenance:

- **Next.js 16**: Built using the App Router for optimal performance and server-side rendering.
- **Service-Oriented Logic**: All business operations and database interactions are encapsulated in the Service Layer (`lib/services`).
- **Data Integrity**: Powered by PostgreSQL and Prisma ORM with strict type safety.
- **Dynamic Localization**: Built-in support for Latvian and English locales, ensuring parity across all user-facing content.
- **Real-time Connectivity**: Integrated with Pusher and Soketi for live updates and interactive features.

## 📂 Internal Structure Overview
- `/app`: Routing and UI layouts.
- `/lib/services`: The core business logic and database access layer.
- `/messages`: Localization definitions for all supported languages.
- `/prisma`: Database schema and migration history.
