# Smart Escape — Interactive Evacuation Route Simulator

Frontend-only browser application for the AI DevFest Mock Test practice challenge.

## Live demo

Replace this line with the public HTTPS deployment URL after publishing (GitHub Pages, Vercel, Netlify, Cloudflare Pages, etc.).

`https://YOUR-LIVE-URL/`

## Repository

Repository name for the mock challenge: `devfest-<registration-number>`.


## Challenge compliance

This implementation is designed to match the supplied practice statement: frontend-only, local JSON import, no participant-controlled backend, no persistent remote database/storage, routing without external APIs, bilingual principal UI, immediate recalculation, reset to initial state, and submission documentation/screenshots. The supplied rules state that actual contest work must be created from T+0 and committed only during the contest window; this package is therefore a mock-test implementation for practice, not a claim of compliance with a live contest's timing/history requirements.

## What is implemented

- Local `building.json` import with client-side validation.
- Sample building loader.
- SVG map rendered from the supplied node coordinates and edges.
- Readable node labels, node types, and corridor costs.
- Start selection for rooms/junctions.
- Lowest-cost route calculation using edge costs only.
- Undirected corridors.
- Block/unblock rooms and junctions.
- Block/unblock corridors.
- Close/reopen exits.
- Immediate recalculation after changes.
- Original `initial_state` reset.
- `Starting location blocked` and `No route available` states.
- Equal-cost tie handling: lowest exit ID, then lexicographically smallest node-ID sequence.
- English/Bangla UI modes for principal labels, buttons, statuses, errors and instructions.
- Subtle route and state animations.
- Responsive layout for desktop and smaller screens.
- No backend, database, serverless function, or persistent remote storage.
- Routing works without any external API.

## Run locally

The app can be opened through a local static server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Test the sample

1. Load the sample building.
2. Select `R1`.
3. Baseline route should be `R1 → C1 → C2 → E1` with cost `7`.
4. Click the `C2` node and use the node block control. The route should become `R1 → C1 → C3 → C4 → E2` with cost `11`.
5. Close both exits to verify `No route available`.
6. Select `R2` and verify `R2 → C3 → C4 → E2` with cost `7` for this demo dataset.

## Input schema

The application expects the challenge schema:

- `building`: non-empty string
- `nodes[]`: unique `id`, `label`, `type` (`room`, `junction`, `exit`), numeric `x`, `y`
- `edges[]`: unique `id`, valid `from`/`to`, positive integer `cost`
- `initial_state.blocked_nodes[]`
- `initial_state.blocked_edges[]`
- `initial_state.closed_exits[]`

The validator rejects malformed/inconsistent input before it is loaded.

## Routing behavior

The app uses Dijkstra-style shortest-path search. Blocked nodes, their incident corridors, blocked corridors, and closed exits are excluded. The selected route minimizes the sum of corridor costs. Equal-cost candidates are resolved by exit ID and then the lexicographic sequence of node IDs.

## Files

- `index.html` — application shell
- `styles.css` — UI and SVG map styling
- `app.js` — validation, state management, routing and UI logic
- `building.json` — supplied-schema sample dataset
- `screenshots/` — submission evidence images
- `LICENSE` — MIT License

## AI tools and most useful prompt

AI tool used during development: ChatGPT.

Most useful prompt:

> Build a frontend-only browser implementation of the supplied Smart Escape challenge. Use local JSON import, validate the exact schema, render nodes at their supplied coordinates, calculate lowest-cost routes using corridor costs, exclude blocked nodes/edges and closed exits, implement the specified tie-break rules, recalculate immediately after hazards change, support reset to initial_state, and provide English/Bangla principal UI labels. Do not use a backend or remote database.

## Known limitations

- The application is an educational simulation and not a certified real-world evacuation planning tool.
- Hazard targeting is separate from the route start, so a user can keep R1 as the start while blocking C2. Corridor blocking uses the selected corridor on the map; exit closing uses a selected corridor connected to the target exit.
- The demo dataset is included only for practice; judges can import unseen datasets using the same schema.

## License

MIT. See `LICENSE`.
