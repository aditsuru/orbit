# Orbit

## 1. Introduction

Orbit helps a group find the best time for a meeting. An organizer creates a meeting, members share when they are free, and the system analyzes the responses and suggests the best time.

The product is built around **workspaces**. Every user gets a personal workspace by default and can create or join team workspaces. Meetings always live inside a workspace, so the tool works for one-off plans and as an ongoing part of a team's routine.

Features are listed here in full. Versioning (v1, v2, ...) will be assigned in a later pass.

### Stack

TypeScript, Bun, Next.js, oRPC, PostgreSQL, Drizzle, Neon, Zod, Better Auth, React Query, shadcn/ui, Tailwind CSS.

---

## 2. Core Concepts

| Concept                   | Definition                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Workspace**             | Container for members and meetings. A personal workspace is the default workspace with a single member. |
| **Member**                | A user belonging to a workspace, with a role.                                                           |
| **Meeting**               | A scheduling request created by an organizer inside a workspace.                                        |
| **Attendee**              | A person included in a specific meeting, with an attendee tier.                                         |
| **Response**              | An attendee's votes or availability for a meeting.                                                      |
| **Standing availability** | A user's recurring free time (e.g. weekdays 18:00-20:00). Used as a hint, never a hard filter.          |
| **Joining buffer**        | Extra time added to the meeting duration so everyone can join on time (default 15 min).                 |

---

## 3. Decisions

### Locked

| Area           | Decision                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Tenancy        | Every user has a personal workspace, which is just the default workspace. Teams are additional workspaces. |
| Access         | A meeting is open to workspace members only, or to anyone with the link.                                   |
| Voting modes   | Organizer chooses per meeting: **proposed slots** or **free-time painting**.                               |
| Reminders      | Two types: `meeting-locked` and `pre-meeting`. Both are optional per meeting.                              |
| Attendee tiers | **Required**, **Optional**, **Removed**. Removed people are not asked, notified, or counted.               |
| Tier scope     | Tiers are set per meeting, not per workspace.                                                              |
| Timezones      | Conversion is a core behavior everywhere, not a feature toggle.                                            |

### Open

| Question                  | Current proposal                                                             |
| ------------------------- | ---------------------------------------------------------------------------- |
| Guest access via link     | Login required, name-only guest responses, or a per-meeting setting.         |
| Default attendee tier     | Everyone starts as Optional. The organizer promotes or removes.              |
| Reminder control          | Organizer enables reminders per meeting, and each member can mute their own. |
| Result visibility default | Organizer-only, with a toggle to open it up.                                 |

---

## 4. Features

### 4.1 Authentication (`auth`)

- `auth.sign-up`: email and password registration
- `auth.sign-in`: email and password login
- `auth.oauth`: social login providers
- `auth.session`: session management

### 4.2 Workspaces (`workspace`)

- `workspace.personal-default`: auto-created on signup
- `workspace.create`: create team workspaces
- `workspace.switch`: switch between workspaces
- `workspace.settings`: name, avatar, defaults

### 4.3 Membership (`membership`)

- `membership.roles`: owner, admin, member, guest
- `membership.invite-email`: invite by email
- `membership.invite-link`: join via shareable link
- `membership.invite-domain`: auto-join by email domain
- `membership.remove`: remove or leave workspace

### 4.4 User Profile (`profile`)

- `profile.timezone`: auto-detected, manually overridable
- `profile.standing-availability`: recurring free time, set once
- `profile.notification-preferences`: mute reminders, channel choice

### 4.5 Meetings (`meeting`)

- `meeting.create`: create a meeting in a workspace
- `meeting.details`: title, description, destination or location
- `meeting.duration`: expected duration
- `meeting.buffer`: joining buffer, default 15 min, configurable
- `meeting.voting-mode`: proposed slots or free-time painting
- `meeting.response-deadline`: optional cutoff for responses
- `meeting.access`: workspace-only or anyone with link
- `meeting.edit`, `meeting.duplicate`, `meeting.cancel`, `meeting.reschedule`
- `meeting.template`: reusable meeting presets

### 4.6 Attendees (`attendee`)

- `attendee.add`: add from workspace or via link
- `attendee.tier`: required, optional, removed
- `attendee.remove`: exclude from a meeting, hidden from them
- `attendee.own-tier-visible`: members see only their own tier

### 4.7 Date and Time Selection (`scheduling`)

- `scheduling.slot-picker`: calendar-style date and time selection
- `scheduling.slot-repeat`: repeat a time across multiple days
- `scheduling.proposed-slots`: organizer-defined candidate slots (1 or more)
- `scheduling.free-time-grid`: grid for painting free time
- `scheduling.range`: date range for free-time mode

### 4.8 Responses (`response`)

- `response.vote-slots`: vote on proposed slots
- `response.paint-availability`: mark free time in a grid
- `response.if-needed`: a third "if need be" state besides yes and no
- `response.edit-own`: edit only your own response
- `response.standing-hint`: show standing availability per slot
- `response.duration-check`: warn when free time is too short for duration plus buffer
- `response.comment`: optional note on a response

### 4.9 Timezone (`timezone`)

- `timezone.convert`: all times shown in the viewer's timezone
- `timezone.display-both`: optional dual display (viewer and meeting timezone)

### 4.10 Entry Viewer (`entries`)

- `entries.organizer-view`: organizer sees every response
- `entries.visibility`: organizer-only, own-only, or everyone sees everyone
- `entries.link-view`: simplified mode, viewable by anyone with the link

### 4.11 Analytics (`analytics`)

- `analytics.heatmap`: overlap by time
- `analytics.ranking`: ranked best times
- `analytics.required-filter`: exclude slots blocked by Required attendees
- `analytics.blocked-by`: when no slot fits, show best partial results and name the blocker
- `analytics.optional-weight`: Optional attendees raise ranking
- `analytics.missing`: who has not responded
- `analytics.suggestion`: recommended final time

### 4.12 Confirmation (`confirm`)

- `confirm.lock`: organizer locks the final time
- `confirm.unlock`: reopen voting
- `confirm.summary`: final details page

### 4.13 Notifications (`notify`)

- `notify.meeting-locked`: email when time is confirmed
- `notify.pre-meeting`: email x days or hours before
- `notify.nudge`: remind non-responders
- `notify.toggle-organizer`: organizer enables or disables per meeting
- `notify.toggle-member`: member mutes for themselves
- `notify.chat`: Slack or Discord notifications

### 4.14 Integrations (`integration`)

- `integration.video-link`: Zoom, Meet, or Teams link on confirmation
- `integration.ics-export`: calendar file export
- `integration.calendar-sync`: two-way Google and Outlook sync
- `integration.busy-import`: pre-fill availability from calendar busy time

### 4.15 Recurring Meetings (`recurring`)

- `recurring.series`: repeat a meeting on a schedule
- `recurring.standing-time`: pick a standing time for the series

---

## 5. Attendee Tiers

| Tier         | Meaning                            | Behavior                                                                                        |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Required** | Meeting cannot happen without them | Hard filter. Slots where they are unavailable are excluded, or flagged "blocked by [name]".     |
| **Optional** | Invited, counts toward ranking     | Soft weight. More Optional people available means a higher rank.                                |
| **Removed**  | Not part of this meeting           | Not asked, notified, or counted. Meeting hidden from them. Past responses are kept if re-added. |

---

## 6. Next Steps

1. Resolve the open decisions in section 3.
2. Assign features to versions.
