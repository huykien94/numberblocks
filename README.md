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

The welcome screen introduces the game. Tap **Let’s play / Bắt đầu chơi** to open the four large operation cards, then choose addition, subtraction, multiplication or division. The play screen keeps the large answer buttons on the left and interactive blocks on the right on tablet screens (768px and wider), in both portrait and landscape. On narrow phones, panels stack vertically and finishing an operation brings the answer panel into view. Each mode starts with random numbers. Tap blocks (or groups) to explore the operation. New puzzle is always available and selects a different pair; Try again resets the current puzzle. The main action completes all moves. Count the resulting blocks and select an answer to earn a star. Answer buttons are available immediately, before or after moving blocks. A wrong answer opens a separate, encouraging retry screen. Start again resets the same problem (same two numbers, no moved blocks, no earned star). A correct answer completes the blocks to illustrate the result and awards one star. The equation reveals its result only after a correct answer; the Next puzzle button then starts another round. Change game returns to the operation menu; the logo returns home. Browser back/forward also works through hash-based navigation without requiring server routes. Stars remain only for the current page session.

Subtraction never yields negative answers. Division only offers exact, positive whole-number problems. Addition chooses two numbers from 1 to 5 (sums up to 10); multiplication supports up to 5 blocks × 4 groups.

VI / EN switches the entire game language. Playful interaction sounds use the Web Audio API, enabled by default and initialized only after a click or tap. The sound button mutes effects immediately. Short melodies accompany taps, merging, answers and new puzzles; no audio assets or network requests are needed. Listen to instructions explicitly plays browser speech synthesis with installed Vietnamese or English voices, even when automatic effects are muted. The game remains usable without speech or a network connection after assets load. The optional Google Font falls back to the system sans-serif font.

No account, analytics, advertising or backend. Use the existing checkout in each isolated cloud task; no additional worktree is needed. Development servers must be started again in a new task.

## GitHub Pages

The GitHub Actions workflow `.github/workflows/pages.yml` tests, builds, and deploys pushes to `main`. Vite uses `/numberblocks/` as the base path, so the game is served at `https://huykien94.github.io/numberblocks/` after a successful deployment.

Before the first deployment, a repository administrator must open **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**, and run the deployment workflow. The workflow deliberately does not try to create a Pages site: the default GitHub Actions token cannot enable Pages for the first time. For local development, open the `/numberblocks/` path printed by Vite.
