# Who sees what

A screen shows only what the viewer can use. Members-only pages, parts and events are hidden, not greyed: no tab, lock or empty place for people who may not see them.

## A group

| On a group page | Logged out | Signed in | Pending | Member | Team |
|---|---|---|---|---|---|
| Main button | Sazināties → sign-in pop-up | Sazināties | "Pieteikums nosūtīts" + "Atvērt sarunu"; "Atsaukt pieteikumu" in the group's actions | none (role and "Rakstīt komandai" in the group's actions) | Labot grupu; Iestatījumi in the group's pages |
| Information, public events | yes | yes | yes | yes | yes |
| Members, the Announcements page, members-only events and announcements | hidden | hidden | hidden | yes | yes |
| Announcements marked public (the newest one, on Information) | yes | yes | yes | yes | yes |
| Requests, Settings, posting | hidden | hidden | hidden | hidden | yes (Owner tab: owner only) |

**One button.** A group is reached through one button, Sazināties. Its form has a switch, "Vēlos pievienoties grupai", on while the group takes new members, so the same message also asks to join; without it, it is only a message. There is no separate Join button. A hidden group shows no Sazināties.

**A private group** ("Tikai biedriem") and its events are out of discovery and search; someone with the link sees what a signed-in visitor sees.

## People

- **Who is going.** Logged-out visitors see the number; signed-in viewers see faces and a name. Private profiles are counted, never shown.
- **Contact line** on a profile (and on Biedri rows): shown only to signed-in people who share a group, or to everyone signed in when the Privātums switch allows it; never to visitors. A private profile is seen only by its owner.
- **Site admins** see every admin section; the Komanda roles and deleting are the owner's alone. Site-admin tools never sit in a group's own menu.
  - A site admin sees a **hidden group's** whole version: page, events (page, panel, lists) and public announcements, with the hidden banner. The group's own owner and everyone else are unchanged.
  - **Group modes** (simulated, no membership row): in the admin panel's Grupa tab a site admin can look at any group as its **Īpašnieks**, **Biedrs** or **Apmeklētājs**; off is the default. The mode is an httpOnly cookie, honoured only while the viewer's site role is admin or owner, and resolved in one place (`getViewerAccess`), so the page, tabs and buttons match it. Owner mode can do what the owner does (writes are logged like a site admin's edits), except delete the group or hand over ownership. Member and visitor modes drop site-admin powers inside groups (a hidden group is then a 404, as for the real thing). A bar on every group page shows while a mode is on. Known limit: no row means not in member lists or counts and no member notifications; join and leave still act on the real account.

Hubs have their own table in [Kopienas](hubs.md#who-sees-what).

Next: [Kopienas](hubs.md).
