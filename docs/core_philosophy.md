# Core Philosophy & Project Alignment: Ejam Kopā

This document serves as the true north for all human and AI contributors working on **Ejam Kopā** (Let's Go Together). It outlines our values, core mission, project scope, and the guiding principles for all future development.

---

## 🌍 1. Core Mission & Values
**Ejam Kopā is fundamentally a non-profit, community-driven platform.**
Our primary goal is to minimize friction in the real world. We exist to help people discover local interest groups—such as folk-dancing, choirs, or casual meetups like weekend rafting trips—and connect with like-minded individuals.

* **Community over Commerce:** While groups (like choirs) may have membership fees, the platform's focus is on facilitating the *connection*, not on generating profit. Future features may help groups manage these administrative fees, but our core DNA is non-profit and community-centric.
* **Trust & Safety:** Influenced by platforms like Couchsurfing, we value authentic, safe real-world interactions. In the future, we will explore vouching or reputation systems to further enhance community trust.

## 📍 2. Geographic Scope & Scaling
* **Starting Hyper-Local:** The platform is currently optimized for Latvia, focusing on hyper-local discovery, Latvian/English parity, and local cultural nuances. This allows us to rapidly prototype, test what works, and build a strong foundational community.
* **Built for the World:** While we start locally, our architecture, taxonomy system, and localization (`next-intl`) are built with scale in mind. We do not restrict our potential—if the platform proves successful, it is technically and philosophically ready to expand to other countries.

## 🏗 3. Architectural Pillars (The "Laws")
Our codebase relies on strict architectural boundaries to maintain scalability and prevent tech debt. All developers (AI and human) must adhere to the rules defined in `AGENTS.md`. Key pillars include:

* **The Service Law:** Server Actions must *never* contain raw database (`Prisma`) queries. All data interactions must be delegated to dedicated services in `/lib/services`.
* **The Taxonomy Law (Zero-Flicker Branding):** Group visual identity is inherited from its parent category. CSS variables (`--accent`) are resolved on the server to prevent UI flickering.
* **Localization Parity:** Every user-facing string must be localized in `messages/en.json` and `messages/lv.json`. Hardcoded UI strings are strictly prohibited.
* **Defensive & Strict Typing:** TypeScript strict mode is enforced. The use of `any` or `as any` is banned to prevent silent runtime failures.

## 🛠 4. Current State & Immediate Priorities
The platform is currently in a **prototyping and validation phase**.

**The Immediate Problem:** Recent architectural refactoring by previous AI agents successfully enforced "The Service Law" but introduced significant UI/UX regressions.

**Immediate Priorities for Next Development Cycles:**
1. **Fix UI/UX Regressions:** Identify and resolve missing translations, broken links, non-functional buttons, and layout shifts that were introduced during backend refactoring.
2. **Performance Optimization:** Address slow-loading content, particularly on discovery and group pages. Ensure caching strategies (`unstable_cache`) and component rendering are optimized.
3. **Validate Existing Tech Debt:** Before building massive new features (e.g., Chunk 14: DM System), we must validate if the remaining items in `audit_report.md` (like lingering Service Law violations) are still relevant or if they were resolved.
4. **Iterative Prototyping:** Continue moving through the platform, testing user flows (group creation, event RSVP, discovery), and documenting what works and what is missing.

## 🚀 5. Feature Roadmap (Post-Stabilization)
Once the current UI/UX and performance regressions are resolved, the platform will look toward the following features (tracked in `execution_handoff.md`):

* **Direct Messaging (Chunk 14):** Implementing peer-to-peer real-time communication using Soketi/Pusher.
* **L2 Tag Lifecycle & Admin (Chunk 15):** Allowing users to suggest tags ("wildcards") and giving admins the tools to approve and merge them.
* **Trust & Safety Mechanics:** Researching and implementing a vouching system (Couchsurfing style) to build community reputation.
* **Administrative Tools:** Helping established groups (e.g., choirs) manage their internal rosters and potential membership fee tracking in the future.

---
*Note: Before starting any new development task, always cross-reference this document, `AGENTS.md`, and the latest `audit_report.md` to ensure your work aligns with the platform's current priorities.*