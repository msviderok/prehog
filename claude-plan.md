# PostHog Application Site: Working Plan

Notes only, not final copy. All site copy and voice-over are written/recorded by me, no AI.

> Transcription caveat: the voice transcripts said "hog"/"hawk" and "Yedenka", "Supersede", "Elm". I've assumed **hedgehog** (PostHog mascot). Fix any wrong names below.

---

## 1. Concept

- Interactive website/game as the application itself. The site is the evidence: engineering, product thinking, UX judgment, interaction detail, personality, "being weird".
- Bright cartoon **construction site**, side-scrolling, CSS/browser rendered. Visitor walks around and discovers things. No forced linear tutorial.
- Signature combo: my writing + my voice-over + my engineering work.
- Dual-use goals: close the job-description gaps (AI-native, agents) with real builds.

## 2. Tech and layout facts

- SPA. Interactions that open a "scene" swap the container and background.
- World coords ~0-100 units. Smoothed camera. CSS variables for transforms. Movement via `requestAnimationFrame`.
- Constant physical speed: 100 px/s at scale 1 (1000px scene = 10 units/s, 2000px = 5 units/s).
- Game area is **2/3 of viewport height**, whole world scaled with CSS `transform: scale()` based on height. Width is not resizable independently.
- Existing UI polish: "Press E to interact" keycap, popovers/tooltips, glass popover arrows, animated action buttons, neon/broken sign effects, animated glowing borders. Interaction UI must contrast with bright scenery.
- Backend: **Convex**. Already built: real-time multi-user text chat (befriend users), hand-rolled **WebRTC** 1:1 audio/video calls. Chat/call UI = draggable floating panels, position persists across refresh.

### Layout decision (leaning, not locked)
- Pin game to the **top 2/3**, use the **bottom 1/3 as a persistent UI dock** (chat, calls, voice, action toggles). Fixes the wasted space above/below the vertically-centered game.
- Still to decide: where the chat/call features get *introduced* (hedgehog intro dialogue teaser vs. the dock itself being discoverable). Dock is the current favorite.

### Group voice
- Keep own WebRTC for 1:1 (skill showcase). Use **LiveKit free tier** for multi-user voice only (mesh doesn't scale). Search showed Build tier ~5,000 WebRTC min/month free, no card. Re-verify pricing before building.

---

## 3. Scenes and interactions

Pattern: NPC/marker in main scene. Some open a separate scene (marked **[scene]**).

| # | Interaction | Status |
|---|---|---|
| 1 | **Intro hedgehog**: welcomes visitor, offers choice: explore yourself, or quick tour of what each landmark is | Defined, copy TBD |
| 2 | **Experience tour [scene]**: "museum of hedgehog evolution", 5 stages | Defined (below) |
| 3 | **Wardrobe**: shadcn/Base UI-style carousel of skins, click applies instantly, no confirm, persists after leaving | Defined. **Add hats here too** |
| 4 | **Job application [scene]**: why I'm a fit, NPCs/tabs per value | Content done, NPC mapping is mine to do |
| 5 | **Personal projects [scene]**: Base UI to SolidJS port + two vibe-coded apps | Two apps = placeholder, details TBD |
| 6 | **Second wardrobe** (recolored duplicate asset): explains how this site was built | Direction set, presentation TBD |
| 7 | **Graffiti board**: free SVG paint | Defined (below) |
| 8 | **About me [scene]**: education, hobbies, band videos/music, drum footage | Content TBD |
| 9 | **Chatbot hedgehog** | Defined (below) |
| 10 | **Dance party hedgehog** | Defined (below) |
| 11 | **Ending marker** | Defined (below) |

### 2. Experience tour: 5 stages
1. Yedenka (internal Ukrainian market, backend) + Patterson Apps (outsourcing, multiple projects)
2. Elm-related projects + Supersede
3. Overlay Analytics
4. Valora
5. **Open/empty stage**: me dreaming I got into PostHog. Space hedgehog, "everything is possible at PostHog". Hedgehog evolves like human evolution across stages.

### 6. Second wardrobe: "how this site was built"
- Not customization. Interacting with it explains how the site was made (shows the build process behind the world).
- Still to figure out: how to present it (what to show, format).

### 7. Graffiti board
- Free SVG drawing. **Local only**, ephemeral to each visitor, no shared persistence (can't moderate).
- Include an info tip explaining honestly why it isn't visible to others (I can't filter content).
- Stretch: AI content filter, possibly a toggle, possibly visitor-supplied API key, or a cheap model that won't catch everything. Doubles as an AI-native example I built for this application.

### 9. Chatbot hedgehog
- Self-aware AI version of me answering questions about my background, with light humor about being an AI clone.
- Plugs the **AI-native** nice-to-have.
- Also expose a simple **MCP server** wrapping the same logic (tools like ask-about-me / get-experience). Plugs the **"built things agents use"** requirement and the application form's required question. Estimated ~a day of work.

### 10. Dance party hedgehog
- Interact and the party starts: blinking lights, music, chaos.
- Showcase the **CSS Paint API (Houdini)**. Adapt existing Paint API confetti examples rather than building from scratch.

### 11. Ending marker
- Instead of "you've reached the end": reacts to what the visitor actually explored, calls out what they saw, nudges toward what they missed.
- Idea: AAA-style **discovery/treasure map** showing explored vs. undiscovered areas. Implementation open (HTML structure snapshot rendered to an image, or other).

---

## 4. Voice-over

- My own recording throughout. Structure/placement not decided yet.

---

## 5. Job application content (for scene 4)

Posting: PostHog Product Engineer. Application form requires: GitHub, cover letter, resume, "Have you built anything agents use?" (required), location, sponsorship, preferred teams. Interview: culture call, technical (no live coding), culture/motivation, paid SuperDay ($1,000).

### Values: what I have
- **Transparency**: Snowflake-as-CMS/CRM experiment (too slow for update-heavy work, said so, moved to Postgres). GraphQL didn't work out (codegen/enum friction). tRPC proposal. Page builder failure (over-scoped, lost a client). Sidebar builder failure (months on a barely-needed feature).
- **Autonomy**: made major FE/BE decisions at Overlay. GraphQL then tRPC migrations.
- **Shipping fast**: ~3 Next.js apps (Next + shadcn + Tailwind) in 1-2 weeks at Valora, stack chosen on my recommendation.
- **Time for building**: Overlay and Valora were async-first. Overlay: 5 devs in Ukraine, rest in US, a few touch-base calls a week. Valora: I was the only one in Ukraine, syncs in Slack, long GitHub discussions (open source project).
- **Ambition**: tRPC migration, risky, little investigation time, I owned validating it.
- **Being weird**: this application.
- **Enthusiastic drivers**: page builder (MVP demo in ~2 weeks) and sidebar builder. Some of my most fun work. Downside was over-scoping.
- **Optimistic problem solvers**: sidebar builder. Ran ~2 months, noticed effort vs. need mismatch, brought it to a usable checkpoint that got used and could be expanded, rather than abandoning it.
- **Grown-ups / low ego**: led a team incl. friends, who were interviewed independently. Democratic, blunt feedback welcome ("this is a bad idea"), I pushed bleeding-edge tools, others preferred established, long but constructive arguments, work/friendship boundary held.
- **Genuine builders**: Base UI SolidJS port, this site, page builder, migrations.

### What I'll be doing: what I have
- **Own end to end**: Overlay REST to GraphQL to tRPC; Webpack to Vite; monorepo; backend; shared types/components.
- **Design collaboration**: worked with designers on wireframes ~9 of 10 years. Same designer at Overlay and Valora (she brought me to Valora). Known as a strong communicator and question-asker. Catch interactive states wireframes don't show (hover, disabled, animation) and keep consistency.
- **UX decisions**: Valora exchange: instant calculations, snappy token/network selection, exchange and confirmation screens consistent so users aren't unsure what they agreed to.
- **User feedback**: Overlay clients' frustrations (unvirtualized tables, slow loads) led to table virtualization.
- **Support**: client issues came via management, engineering treated as priority, we jumped on them.
- **Docs**: added a SolidJS example to SuperJSON docs, following existing pattern.

### Requirements and nice-to-haves
- Full-stack: Overlay. 0 to 1: Base UI to SolidJS 1:1 port, 100% API compatible, didn't previously exist in the SolidJS ecosystem.
- Strong writing: this site's copy + voice-over is the evidence.
- React/TS ~9 yrs (since 2017). Django: multiple projects, Django CMS, not a specialist, can pick up fast.
- **High-growth SaaS**: Overlay grew fast in my first year (~10 B2B clients, ~500 users, high contract value), hiring planned to double/triple, then stalled after SVB / mid-2022 crisis. Company won Snowflake's startup challenge, ~$250k in Snowflake credits, promoted by Snowflake. Valora: larger established consumer user base.
- **AI-native**: vibe-coded personal projects (full and partial); Base UI was designed with agent-friendly APIs (not my achievement). To be strengthened by chatbot + AI graffiti filter.

### Honest gaps
- **Talking to users directly**: went through management. Frame as acting on relayed user signal, wanting the closer loop.
- **Agents**: no prior example. Fix by building the MCP server (scene/hedgehog 9). Until built, say honestly it's a gap.

### Lessons (keep these, they're the point)
- Ask enough questions to know what actually needs building.
- Don't invest heavily in something rarely used.
- Find the minimum solution to test an idea, start there.
- Want teammates to challenge and "roast" my ideas, bluntly.

### Why PostHog
Autonomy, product thinking, problem solving, understanding the business has to work, contributing ideas not just tickets, the right attitude and passion, strong alignment with the handbook, an environment where I could get the most out of myself.

---

## 6. Open decisions

- [ ] NPC to section mapping for the job application scene (mine)
- [ ] Intro hedgehog copy and the tour-vs-explore branch
- [ ] Second wardrobe: how to present "how this site was built"
- [ ] Where chat/calls/voice get introduced; confirm bottom-dock layout
- [ ] Two vibe-coded projects: names and details
- [ ] About-me scene content (education, hobbies, band media)
- [ ] Ending marker: how to build the discovery map
- [ ] Completion logic: how the site tracks "seen everything"
- [ ] Voice-over structure and placement
- [ ] Hats added to wardrobe 1

## 7. Suggested build order

1. Layout: top 2/3 game, bottom dock, floating panels.
2. Wardrobe 1 with skins + hats (system already exists).
3. Scene-swap routing for the [scene] interactions.
4. Intro hedgehog + tour branch.
5. Chatbot + MCP server (closes the form's required agents question).
6. Graffiti board (local-only + info tip).
7. Dance party hedgehog.
8. Ending marker with explored-tracking, then the discovery map.
9. LiveKit group voice.
10. Fill scene content and record voice-over last, once content is stable.
