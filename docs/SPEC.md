# Guild Website — Project Spec (Phase 1)

Nov 20, 2026 · @David

## Overview & goals

Phase 1 delivers a private, invite-only website where a D&D group ("the guild") keeps its shared in-world records and its players' character sheets.

**Goals**

1. Players can register with an invite code, create characters, and play from a rules-aware character sheet on desktop or phone.
2. Anyone in the guild can write, search and link in-world records (adventure logs, notices, lore, person records and so on).
3. Characters and NPCs show every record they are tagged in, so the guild's history is browsable from either side.
4. Both the 2014 and the 2024 base rules (SRD 5.1 and SRD 5.2) are supported, chosen per character.

**Glossary**

- **Player**: a real person with an account.
- **Character**: a player character (PC) owned by one player.
- **NPC**: a non-player character with a simple profile.
- **Record**: an in-world document in the Guild Records.
- **Ruleset**: `2014` (SRD 5.1) or `2024` (SRD 5.2). The group's default is 2014.

## Users & roles

There are three roles: **Admin**, **DM** and **Player**. A person can hold several (stored as a list on their profile). Everyone who registers gets Player; only an Admin can grant or remove DM and Admin. The first account is made Admin by hand in the database.

All permissions are enforced in the database with Supabase Row Level Security (RLS), not only by hiding buttons.

| Action | Player | DM | Admin |
| --- | --- | --- | --- |
| View any character, record, NPC, profile | Yes | Yes | Yes |
| Create characters | Own only | Own only | Own only |
| Edit or delete a character | Own only | Own only | Any |
| Create a record | Yes | Yes | Yes |
| Edit, delete, redact or restore a record | Own only | Own, plus any Adventure Notice or Adventure Log | Any |
| Convert an Adventure Notice to an Adventure Log | Own only | Any | Any |
| Create NPCs | Yes | Yes | Yes |
| Edit or delete an NPC | Own only | Any | Any |
| Create custom items, species, classes, spells (homebrew) | Yes | Yes | Yes |
| Edit or delete homebrew content | Own only | Own only | Any |
| Manage invite codes, master code, roles, record categories | No | No | Yes |

**Registration**

- Signing up needs a valid invite code.
- **One-time codes**: an Admin generates them. Each works for exactly one sign-up, then is marked used (with who used it and when).
- **Master code**: exactly one exists. It always works, and an Admin can change it at any time. Changing it stops the old value from working.
- Login is email and password (Supabase Auth).

## Tech stack & architecture

The app is a single-page web app that talks straight to Supabase. There is no separate backend server in Phase 1.

| Layer | Choice |
| --- | --- |
| Language | TypeScript, `strict` mode |
| Frontend | React + Vite, React Router |
| Styling | Tailwind CSS |
| Database | Supabase Postgres, with RLS on every table |
| Auth | Supabase Auth (email + password) |
| Images | Supabase Storage buckets: `character-pictures`, `npc-pictures`, `record-images` |
| Server-side logic | Postgres functions (RPC), e.g. invite-code check, redaction |
| Tests | Vitest (unit), plus a small set of RLS tests against a local Supabase |
| Hosting | Static hosting on a free tier (Vercel); Supabase free tier |

**Code layout**

- `src/rules/`: the rules engine. Pure TypeScript functions with no React or Supabase imports, so it can be unit-tested on its own.
- `src/data/`: typed Supabase queries, one module per entity.
- `src/pages/`: one folder per page.
- `src/components/`: shared UI (thumbnails, meters, search bar).
- `supabase/migrations/`: all schema, RLS policies and functions, as SQL migrations.
- `supabase/seed/`: SRD 5.1 and SRD 5.2 rules data.

## Data model

Every table has `id` (uuid), `created_at` and `updated_at` unless noted. "FK" means a foreign key.

### Accounts

| Table | Fields |
| --- | --- |
| `profiles` | `id` (= auth user id), `username` (unique, 3–24 chars), `roles` (array of `admin` / `dm` / `player`) |
| `invite_codes` | `code` (unique), `kind` (`one_time` / `master`), `created_by` FK profiles, `used_by` FK profiles nullable, `used_at` nullable, `revoked` bool. Only one `master` row may exist. |

### Rules content

Each rules table has `ruleset` (`2014` / `2024`), `source` (`srd` / `homebrew`), `created_by` (null for SRD) and a `data` JSON column for details that vary by type.

| Table | Holds |
| --- | --- |
| `rules_species` | Name, size, speed, traits |
| `rules_classes` | Name, hit die, saving throw proficiencies, spellcasting ability (nullable), features by level |
| `rules_subclasses` | Parent class FK, name, features by level |
| `rules_backgrounds` | Name, proficiencies, feature |
| `rules_spells` | Name, level, school, casting time, range, components, duration, description, class list |
| `items` | Name, type (weapon / armor / gear / magic / other), weight (lb), value (gp; blank = no set monetary value, seeded from SRD cost), requires attunement, description, armor and weapon stats in `data` |

SRD rows are read-only to everyone.

### Characters

| Table | Fields |
| --- | --- |
| `characters` | `owner_id` FK profiles, `name`, `ruleset`, `species_id`, `background_id`, `picture_path`, six ability scores, `hp_max`, `hp_current`, `hp_temp`, `death_save_successes` / `failures` (0–3), `currency` (cp, sp, ep, gp, pp), `notes` |
| `character_classes` | `character_id`, `class_id`, `subclass_id` nullable, `level` (1 or more; above 20 allowed), `hit_dice_spent` |
| `character_proficiencies` | `character_id`, `kind` (skill / save / tool / weapon / armor / language), `name`, `expertise` bool |
| `character_features` | `character_id`, `name`, `description`, `source` (class / species / background / feat / custom), `max_uses` nullable, `uses_spent`, `recharge` (`short_rest` / `long_rest` / `none`) |
| `character_spells` | `character_id`, `spell_id`, `prepared` bool |
| `character_spell_slots` | `character_id`, `slot_level` (1–9), `max`, `spent`, `recharge` (`long_rest`, or `short_rest` for pact magic) |
| `character_adjustments` | `character_id`, `field` (any field key, e.g. `ability.str`, `ac`, `skill.stealth`, `save.wis`, `hp_max`, `speed`, `species`), `custom_modifier` (integer, nullable), `custom_override` (text, nullable), `note`. One row per field. |
| `inventory_entries` | `character_id`, `item_id`, `quantity`, `equipped` bool, `attuned` bool |

A character's total level is the sum of its `character_classes` levels. Max 3 attuned items per character.

### Records

| Table | Fields |
| --- | --- |
| `record_categories` | `name` (unique), `is_system` bool. System rows: Adventure Notice, Adventure Log, Lore, Journal/Diary, Notice/Bounty, Report, Person Record, Misc. |
| `records` | `owner_id` FK profiles, `contributor_character_id` nullable FK characters (must be owned by `owner_id`), `category_id`, `record_date` (date, defaults to today), `subject`, `body` (Markdown), `redacted` bool, `redacted_by`, `redacted_at` |
| `record_images` | `record_id`, `storage_path`, `position` |
| `record_tags` | `record_id`, `target_type` (`character` / `npc` / `record`), `target_id`. Unique on all three. |
| `npcs` | `created_by` FK profiles, `name`, `picture_path`, `description` (Markdown) |

## Features by page

Each page lists what it does, then **Done when**: the checks that must pass before the page counts as finished. Every page except Login and Register requires a signed-in user.

### Navbar (all signed-in pages)

Links: Guild Members (Players, Characters), Guild Records, NPCs, Compendium, My Profile, and Admin (Admins only). Collapses to a menu button under 768 px wide.

Done when:

- The Admin link is visible only to Admins.
- Every link works on desktop and in the collapsed mobile menu.

### Login and Register

Register asks for username, email, password and invite code.

Done when:

- Sign-up with a missing, used, revoked or wrong code fails with "Invalid invite code" and creates no account.
- Sign-up with an unused one-time code succeeds and marks that code used by the new account.
- Sign-up with the current master code succeeds every time; the previous master value fails.
- The code check and the code update happen in one database function, so two people cannot use the same one-time code.
- Duplicate usernames are rejected.

Login asks for email and password, and has a **Forgot password** link.

Done when:

- Wrong email or password fails with "Incorrect email or password", without saying which was wrong.
- Success goes to the page the user was trying to open, or Guild Records if none.
- The session survives page reloads until the user clicks **Log out** (in the navbar).
- A signed-out visitor to any other page is sent to Login.
- Forgot password sends a Supabase reset email; the link lets the user set a new password.

### Guild Members: Players

A list of all players (username and number of characters). Each links to their Player Profile.

### Guild Members: Characters

A grid of character thumbnails for every character, sortable by name or level and filterable by owner.

**Character thumbnail** (used everywhere): picture, name, guild rank insignia, species, and highest-level class with its level. Clicking it opens the Character Profile.

Done when:

- A multiclass character shows its highest-level class; on a tie, the class gained first.
- A character with no picture shows a placeholder.

### Player Profile

Username, their roles, their character thumbnails, a **New character** button (own profile only), and the records they own (newest first).

### Character form (create and edit)

One form is used for both. **New character** opens it empty; **Edit** (owner and Admins) opens it filled with the character's current values. The guided wizard is Phase 2.

Fields: name, ruleset (defaults to 2014), species, background, classes and subclasses with levels, ability scores (entered by hand), max HP (new characters: pre-filled with the class's level-1 value, hit die maximum + Con modifier), proficiencies and expertise, features and custom abilities, spells, and picture.

Every field has two extra inputs, tucked behind an "Adjust" toggle so the form stays readable:

- **Custom Modifier**: a whole number (can be negative) that is always added to the field's value, even when the result breaks a rule.
- **Custom Override**: if filled in, this value is always displayed, ignoring the rules value and the Custom Modifier.

Numeric fields get both inputs. Non-numeric fields (species, class names and so on) get only Custom Override. Both apply to derived stats too (AC, saves, skills, speed, initiative, spell save DC and so on), which are shown read-only in the form with their Adjust inputs. Each adjustment has an optional note (e.g. "Ring of Protection").

Done when:

- New and Edit open the same form component; Edit shows every current value, and saving updates the character instead of creating a new one.
- Species, class and background dropdowns only show options for the chosen ruleset (SRD plus homebrew).
- New characters get their level-1 class features automatically; saving lands on the Character Profile.
- **With no adjustments filled in, rules are enforced**: ability scores must be 1–20, current HP cannot exceed max HP, and every derived stat equals the rules engine's value.
- **With adjustments filled in, illegal results are accepted**: e.g. Str 20 with Custom Modifier +2 saves and shows 22; AC with Custom Override 25 shows 25 whatever armor is equipped.
- Override wins over Modifier when both are set. Clearing both returns the field to its rules value.
- On the sheet, hovering or tapping an adjusted value shows its breakdown: rules value, Custom Modifier, Custom Override, and notes.

### Character Profile

Layout: on screens 1024 px and wider, the character sheet is on the left and the picture on the right. Narrower, the picture sits above the sheet.

The sheet is modeled on the D&D Beyond layout (layout only, no D&D Beyond content):

- **Header**: name, rank insignia, species, classes and levels, ruleset badge. **Short Rest** and **Long Rest** buttons and a **Level up** button (owner and Admins only).
- **Ability scores**: score and modifier for all six.
- **Saves and skills**: with proficiency and expertise marks; passive Perception.
- **Combat**: AC, initiative, speed, proficiency bonus, HP tracker, death saves.
- **Tabs**: Actions (equipped weapons, attack bonus, damage), Spells (slots and spell list, casters only), Inventory, Features & Traits (with **Add custom ability**), Notes.

Below the sheet: **Referenced in**, the records tagged with this character. Adventure Logs are listed separately, in order of their record date (oldest first). All other records are listed newest first.

Done when:

- Every derived number matches the rules engine (see Rules engine).
- Non-owners see the whole sheet but no edit, rest, HP or level-up controls.

### HP tracker

Two meters: one for current HP (out of max) and one for temporary HP. Controls: an amount box with **Damage** and **Heal** buttons, and a **Set temp HP** button.

Done when:

- Damage comes off temp HP first; any excess comes off current HP. Current HP never goes below 0.
- Healing raises current HP up to max and never changes temp HP.
- Setting temp HP replaces the old value only if the new one is higher (temp HP does not stack).
- At 0 HP the death save boxes appear; healing above 0 clears them.

### Inventory (tab on the sheet)

A list of items with quantity, weight, value, equipped and attuned toggles, plus currency, total carried weight, and total value. **Add item** lets you search the item catalog (SRD for the character's ruleset, plus homebrew) or create a new homebrew item, which is then saved to the catalog for everyone.

Done when:

- A 4th attuned item is refused with a message.
- Equipping armor or a shield updates AC.
- Only the item's creator (or an Admin) can edit a homebrew item.
- Items with no value show "—" and are left out of the total value (they don't count as 0).

### Level up

Pick a class (an existing one, or a new one to multiclass), then enter the HP gained (pre-filled with the class's fixed average + Con modifier, minimum 1). New class features for that level are added automatically. No other guided steps in Phase 1.

Done when:

- Total level, proficiency bonus, hit dice, spell slots and rank all update.
- Levels above 20 are allowed. Past 20, proficiency bonus keeps following the formula and spell slots stay at their level-20 values.

### Guild Records (list and search)

A list of records as cards (subject, category, record date, owner, contributor), newest record date first, with a **Create record** button.

Search and filters: owner, contributor, category, record date range, and a text box matching subject or body. Sort by record date (default) or subject.

Done when:

- Filters combine (e.g. category = Adventure Log AND contributor = X).
- Redacted records still appear in the list, as redacted cards, but never match text searches.

### Record view

Shows all fields, the images, and the rendered Markdown body. Tags appear as links to the tagged characters, NPCs and records.

Controls for people allowed to (see the roles table): Edit, Delete, Redact / Restore, and on Adventure Notices, **Mark complete**.

- **Mark complete** turns the Adventure Notice into an Adventure Log. It keeps the same record, opens the editor so the author can write what happened, and sets the record date to today (editable).

### Record editor

Fields: category, contributor (blank, or one of the owner's own characters), record date (defaults to today), subject, body (Markdown with a preview), images (upload and reorder), and tags (search box for characters, NPCs and records).

Done when:

- Owner defaults to the signed-in player. Only Admins can change it, to any player. If the new owner doesn't own the contributor character, the contributor is cleared.
- Images over 5 MB, or not JPEG, PNG or WebP, are refused.

### Redaction

Redacting a record hides it in-world. Its row stays, so players can see that something was removed.

Done when:

- A redacted record shows only a "REDACTED" card everywhere it appears (list, Referenced in, tag links). Subject, body, images, contributor, owner and tags are hidden.
- The hidden fields are never sent to the browser for anyone: the database returns only the record's id, redacted flag and record date. (Enforced in the database, not the UI.)
- People allowed to redact see a **Restore** button on the redacted card. Restoring brings everything back unchanged.

### NPCs

An NPC list (picture and name) and an NPC profile page: picture, name, description, and a Referenced in list like the character one. Anyone can create an NPC.

**Person Records** are the casual alternative: a record in the Person Record category, written about someone met in-game, without making a full NPC profile. A Person Record can be tagged with an NPC if one exists.

### Compendium (rules content and homebrew)

A browsable library of species, classes, subclasses, backgrounds, spells and items, filterable by ruleset and by source (SRD or homebrew). Each type has a create and edit form, so homebrew is as easy to add as possible and missing SRD content can be typed in by hand.

Done when:

- Anyone can create homebrew entries; only the creator or an Admin can edit or delete them.
- Only Admins can create or edit entries marked SRD (for filling gaps in the import).
- New entries show up immediately in the character form and inventory pickers for their ruleset.
- Deleting an entry that a character uses is refused, with a list of the characters using it.

### Admin

- Invite codes: generate one-time codes, see used / unused / revoked, revoke unused ones.
- Master code: view and change it.
- Roles: grant or remove DM and Admin for any player. An Admin cannot remove their own Admin role.
- Record categories: add, rename or remove non-system categories. A category in use cannot be removed.

## Rules engine

All calculations live in `src/rules/` as pure functions that take a character (and its ruleset) and return numbers. Every displayed value = the Custom Override if one is set; otherwise the rules value + the Custom Modifier (0 if blank). Each function has unit tests covering both rulesets wherever the rulesets differ.

### Derived stats

| Stat | Rule |
| --- | --- |
| Ability modifier | floor((score − 10) / 2) |
| Total level | Sum of all class levels |
| Proficiency bonus | 2 + floor((total level − 1) / 4) |
| Saving throw | Ability modifier + proficiency bonus if proficient |
| Skill | Ability modifier + proficiency bonus if proficient (×2 with expertise) |
| Passive Perception | 10 + Perception skill |
| Initiative | Dex modifier |
| AC | No armor: 10 + Dex. Light: base + Dex. Medium: base + Dex (max +2). Heavy: base. Shield: +2. Uses equipped items only. |
| Weapon attack bonus | Str modifier (Dex for ranged; the higher of the two for finesse) + proficiency bonus if proficient |
| Spell save DC | 8 + proficiency bonus + spellcasting ability modifier |
| Spell attack bonus | Proficiency bonus + spellcasting ability modifier |
| Spell slots | From the class's SRD slot table. Multiclass slots follow each SRD's multiclass spellcaster rules; tests are written from the SRD text. |
| Hit dice | One die per class level, of that class's hit die size |

Class-specific AC formulas (such as Unarmored Defense) are not calculated. Players set them with the AC Custom Override.

### Guild rank

Based on total level.

| Total level | Rank |
| --- | --- |
| 1–4 | Iron |
| 5–8 | Bronze |
| 9–12 | Silver |
| 13–16 | Gold |
| 17+ | Platinum |

### HP

- **Damage n**: temp HP drops by min(n, temp). The rest comes off current HP, to a minimum of 0.
- **Heal n**: current HP = min(current + n, max). Temp HP is unchanged.
- **Set temp HP t**: temp = max(temp, t).
- **Death saves**: shown at 0 HP. Three successes = stable; three failures = dead (shown, not enforced). Reset when HP rises above 0.

### Rests

|  | Short rest | Long rest |
| --- | --- | --- |
| HP | Spend any number of available hit dice. Each heals the entered (or rolled) die result + Con modifier, minimum 0. | Current HP to max |
| Temp HP | Unchanged | Set to 0 |
| Hit dice regained | None | 2014: half of total level, rounded down, minimum 1. 2024: all. |
| Features | Reset `short_rest` uses | Reset `short_rest` and `long_rest` uses |
| Spell slots | Reset `short_rest` slots (pact magic) | Reset all slots |
| Death saves | Unchanged | Reset |

## Non-functional requirements

- **Scale**: one guild, under 50 players. Must run on the Supabase and hosting free tiers.
- **Security**: RLS on every table; no table readable without sign-in. Storage buckets readable by signed-in users only. No secrets in frontend code beyond the Supabase public (anon) key.
- **Responsive**: works from 360 px phone width up to desktop. Breakpoints: 768 px (navbar), 1024 px (character profile two-column layout).
- **Browsers**: current Chrome, Firefox, Safari and Edge, desktop and mobile.
- **Accessibility**: every control reachable by keyboard; images have alt text; insignia have text labels.
- **Data updates**: pages show fresh data on load and after the user's own changes. No live updates from other users in Phase 1.
- **Licensing**: SRD 5.1 and SRD 5.2 are CC-BY-4.0. The site footer carries the required attribution. No D&D Beyond or other non-SRD content is shipped.
- **Quality**: TypeScript strict with no `any`; lint and type check pass; the rules engine has unit tests for every function.

## Out of scope (Phase 2 or later)

Agents must not build these in Phase 1.

- **Character creation wizard**: step-by-step creation, with a "show tutorial prompts" checkbox at the start (default off).
- **View-as role switcher**: a person with several roles picks which role they view the site as, from their Player Profile.
- **Private and DM-only records**: visibility settings on records.
- **Discord login**.
- **Live updates** (e.g. HP changing on other screens during a session).
- **Guided level-up** (choosing new features, ASIs, spells step by step).
- Dice roller, notifications, multiple guilds, native mobile app.

## Milestones

Each milestone ends with something usable, and each will be split into agent tasks later.

1. **Setup**: repo, Vite + React + TypeScript, Tailwind, lint, Vitest, local Supabase, first migration, deploy of an empty app. (Done together, step by step.)
2. **Accounts**: profiles, roles, invite codes (one-time and master), Register, Login, navbar, Admin page for codes and roles.
3. **Rules data**: rules tables and migrations, seed import of whatever SRD 5.1 and SRD 5.2 data is available, item catalog, and the Compendium pages for browsing and hand-entering content.
4. **Rules engine**: every function in the Rules engine section, with unit tests. No UI.
5. **Characters, part 1**: Character form (create), Character Profile sheet (read-only), thumbnails, Characters and Players lists, Player Profile.
6. **Characters, part 2**: Character form (edit), Custom Modifier and Custom Override with breakdowns, HP tracker, rests, level up, inventory, spells, custom abilities.
7. **Records**: categories, record editor, images, tags, Guild Records list and search, Record view, Referenced in lists.
8. **Records, part 2**: redaction and restore, Adventure Notice to Adventure Log, NPCs, Person Records, Admin category management.
9. **Polish and launch**: mobile pass, accessibility pass, attribution footer, RLS tests, invite the guild.

## Decisions

Questions settled during review. Agents follow these.

- **SRD data**: import whatever SRD 5.1 and SRD 5.2 data is available from open datasets, and add the rest by hand through the Compendium. Homebrew uses the same forms.
- **Redacted cards**: show the record date only.
- **Previewing redacted records**: not allowed. Restore first.
- **Unarmored Defense and similar AC rules**: not calculated; players use the AC Custom Override.
- **Deleting a character or NPC**: its tags are removed; the records stay.
- **Hosting**: Vercel (frontend) and Supabase (database, auth, storage).
