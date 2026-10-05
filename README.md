# Numberblocks · Little Math Club

A Vietnamese / English math playground for preschool children, built with vanilla JavaScript and Vite. Illustrated block characters are drawn with CSS; no image service or API key is required.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /tmp/numberblocks-npm-cache
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Play

The welcome screen introduces the game. Tap **Let’s play / Bắt đầu chơi** to open the four large operation cards, then choose addition, subtraction, multiplication or division. The play screen keeps the large answer buttons on the left and interactive blocks on the right on tablet screens (768px and wider), in both portrait and landscape. On narrow phones, panels stack vertically and finishing an operation brings the answer panel into view. Each mode starts with random numbers. Tap blocks (or groups) to explore the operation. New puzzle is always available and selects a different pair; Try again resets the current puzzle. The main action moves the remaining blocks one at a time with a visible flight and spoken count. Tap effects and count narration start with the action, concurrently with the flight. Correct-answer effects and spoken praise start immediately; their demonstration animates without interrupting the praise with count narration. Addition retains the colors of both groups; subtraction moves removed blocks to a separate tray and counts what remains in the original tray, multiplication preserves visible equal groups, and division places blocks into groups in turn and asks about each friend’s share. Motion respects the device’s Reduce Motion preference. Starting another puzzle, answering, changing language, resetting or leaving the tab cancels in-progress movement without leaking moves into another puzzle. Count the resulting blocks and select an answer to earn a star. Answer buttons are available immediately, before or after moving blocks. Their positions are shuffled once per new puzzle and stay fixed during moves, audio/language changes and retrying the same puzzle. A wrong answer opens a separate, encouraging retry screen. Start again resets the same problem (same two numbers, no moved blocks, no earned star). A correct answer completes the blocks to illustrate the result and awards one star. The equation reveals its result only after a correct answer; the Next puzzle button then starts another round. Change game returns to the operation menu; the logo returns home. Browser back/forward also works through hash-based navigation without requiring server routes. Stars remain only for the current page session.

The operation menu starts with quantities up to 5 and offers ranges up to 10 and 20. The 20 range expands addition and subtraction; multiplication and division remain within 10. Operands, results and multiple-choice options stay within the effective range for the selected operation. Subtraction can reach zero but never goes negative. Division always gives a positive whole-number share. Addition uses five spaces per row, with two separate ten-space trays at level 20; multiplication keeps the equal groups visible. The retry screen offers both starting over manually and a guided Count together replay of the same puzzle. See [Learning design](docs/learning-design.md) for the Montessori-inspired rationale, the distinction from physical Montessori materials and the limits of the reference review.

VI / EN switches the entire game language. Audio starts only after interaction; no music plays on initial page load. The interactive-latency AudioContext and voice list are prepared on pointer-down or keyboard activation. Idle speech is not unnecessarily cancelled. The app does not wait for animations before requesting speech, but actual speech-engine/hardware latency depends on the device.

- Original, gentle background music loops locally through the Web Audio API. **Music / Nhạc nền** toggles only music; the speaker button mutes music, effects and automatic narration together. The music preference is retained when toggling the master speaker within a session.
- Distinct short melodies accompany taps, merging, correct answers, retry screens and new puzzles. Correct and wrong answers also receive spoken encouragement when speech is available.
- Entering a game, starting a new puzzle, replaying or resetting reads the actual random operands and operation: “Một cộng một bằng mấy?” / “What is one plus one?”. Switching VI / EN in a game rereads the current puzzle in that language. **Hear the puzzle / Nghe bài toán** explicitly repeats it, even if automatic sound is muted.
- Narration uses the browser's Vietnamese or English voice, as in the version before bundled synthesized clips were introduced. Questions, number counting and feedback all use the same language-matched voice. Voice quality and availability depend on the device/browser. No MP3 speech files are downloaded. If the voice list is incomplete (as can happen on Android), the game immediately submits the requested language to the native engine. A late voiceschanged event can retry an unstarted prompt with the newly available voice. Failed or silently stalled starts retry once without a pinned voice, then show a nonblocking diagnostic. Unsupported speech, blocked playback and unavailable languages have separate messages. Normal pitch (1.0) is used, and Vietnamese praise says “Chính xác! Giỏi lắm!”. Old speech is cancelled on navigation or a new prompt; music lowers during speech and returns afterward. No speech API or runtime credentials are needed.
- All audio pauses when the tab is hidden. Music resumes when returning to an already activated session; interrupted speech is not replayed automatically. Music is synthesized locally with no external music requests; speech uses the browser voice service. This does not provide full offline installation. The optional Google Font falls back to the system sans-serif font.

No account, analytics, advertising or backend. Use the existing checkout in each isolated cloud task; no additional worktree is needed. Development servers must be started again in a new task.

## GitHub Pages

The GitHub Actions workflow `.github/workflows/pages.yml` tests, builds, and deploys pushes to `main`. Vite uses `/numberblocks/` as the base path, so the game is served at `https://huykien94.github.io/numberblocks/` after a successful deployment.

Before the first deployment, a repository administrator must open **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**, and run the deployment workflow. The workflow deliberately does not try to create a Pages site: the default GitHub Actions token cannot enable Pages for the first time. For local development, open the `/numberblocks/` path printed by Vite.

## Android speech troubleshooting

Music and speech use different browser APIs. Music working does not prove that Android text-to-speech is configured. Open **Speech help / Cách bật giọng đọc** in the warning, or **For parents / Dành cho ba mẹ**, then **Test voice / Thử giọng đọc**.

On Samsung tablets, check **Settings → General management → Text-to-speech** (names vary with Android versions). Select Google's speech engine if available and install Vietnamese or English voice data as appropriate. Verify the device's own speech preview, reopen Chrome and test the game again. The web app cannot install Android voices or change the preferred speech engine. Browser tests simulate missing/late voices and silent engines; a physical Samsung Tab S6 has not been verified.
