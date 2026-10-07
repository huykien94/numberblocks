# Tablet experience and continuity

Reviewed on 2026-10-07. The current game already provides manipulable quantities, two languages, four operations, levels 5/10/20, optional sound and a supportive retry flow. This increment addresses three observable gaps: reloads discarded preferences and progress, play had no natural stopping point, and the game could not be reliably reopened without a connection.

## Decisions

- **Five completed puzzles per round:** a predictable, visible ending and an invitation to rest or count real objects. There is no countdown, streak, leaderboard or penalty for mistakes. Five is a product choice to keep rounds small, not a research-backed prescription for all preschoolers. Skipping, resetting and retrying the same puzzle do not award additional round progress.
- **Local settings and parent totals:** remember the selected language, range and audio settings. Show completed puzzles by operation, including assisted answers. These numbers describe activity, not mastery. Only aggregate counts and preferences are stored; no child profile, answer history, dates or telemetry are introduced. Storage errors do not block play.
- **Installable, offline-capable app:** keep a tablet home-screen entry and open in standalone mode when the browser supports installation. Cache the complete built game and report readiness only after activation. Speech availability remains a device constraint; installing the game cannot install Android voices.
- **Explicit updates:** use the service-worker waiting lifecycle. Offer a parent-controlled reload with a clear notice about the current puzzle; retain saved preferences and totals. Do not reload automatically in the middle of play.

The separate wrong-answer screen and ability to answer before moving blocks are preserved as requested. The existing Montessori-inspired quantity activities are retained; this increment does not claim a measured improvement in learning outcomes.

## Reviewed technical references

The official MDN article sources were retrieved and read through the MDN content repository; the public documentation links are below.

- [Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable): manifest requirements, 192/512 icons, secure origins, standalone display, platform-specific install flows and `beforeinstallprompt` availability.
- [Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers): installation precaching, activation and waiting workers, scoped fetch handling, versioned caches and cleanup.

These sources support the technical implementation. They do not establish educational effectiveness or an ideal session length.

## Validation and remaining observation

Automated unit tests cover preference restoration, malformed data, blocked/full storage and counting a completed puzzle only once per round, alongside existing math and audio behavior. Production-browser checks exercise retry, five-puzzle completion, persistence, offline reload, cached game interactions and opt-in updates. Tablet portrait/landscape and phone viewports are checked for layout overflow.

A physical Samsung Tab S6 installation, its installed voices and iPad installation still require device testing. The useful next learning check is to observe whether a child can explain what happened to the quantities and reproduce the operation with real objects. Do not infer understanding solely from correct multiple-choice answers or the new activity totals.
