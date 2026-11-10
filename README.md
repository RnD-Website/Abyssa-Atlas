# Abyssa Atlas

A concept ocean-data explorer: a scroll-driven story where a small submarine dives through three depths (Observe, Trace, Illuminate), each with a short mini-game. All 3D assets are generated procedurally with three.js (loaded from a CDN). Abyssa is a fictional brand.

## Run locally

```bash
ruby -run -e httpd . -p 5210
```

Open http://localhost:5210/

## Ask Atlas (AI guide)

The chat calls `POST /api/ask` (`api/ask.js`, a Vercel serverless function using the Anthropic Messages API). Set `ANTHROPIC_API_KEY` in the deployment environment. Without that route (for example on a plain static server) the chat falls back to a built-in keyword guide and labels itself "Offline guide".

### Dive Planner

"Plan my dive" in the chat turns a goal (for example "I want to see how things move") into a short route through the depths and can fly the submarine along it as a guided tour. It uses the same `/api/ask` route (`mode: "plan"`), with the same offline fallback.
