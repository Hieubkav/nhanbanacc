lỗi 

[02:03:53.205] Running build in Washington, D.C., USA (East) – iad1
[02:03:53.206] Build machine configuration: 2 cores, 8 GB
[02:03:53.221] Cloning github.com/Hieubkav/nhanbanacc (Branch: master, Commit: 7793789)
[02:03:53.585] Cloning completed: 364.000ms
[02:03:58.214] Restored build cache from previous deployment (2kqcta57JZnY6RUnfGrX7jveKpGP)
[02:03:58.795] Running "vercel build"
[02:03:59.181] Vercel CLI 47.0.5
[02:03:59.346] > Detected Turbo. Adjusting default settings...
[02:03:59.495] Running "install" command: `bun install`...
[02:03:59.740] bun install v1.2.21 (7c45ed97)
[02:03:59.776]
[02:03:59.776] Checked 234 installs across 323 packages (no changes) [257.00ms]
[02:03:59.779] Detected Next.js version: 15.5.0
[02:03:59.780] Running "turbo run build"
[02:04:00.137]
[02:04:00.137] Attention:
[02:04:00.137] Turborepo now collects completely anonymous telemetry regarding usage.
[02:04:00.138] This information is used to shape the Turborepo roadmap and prioritize features.
[02:04:00.138] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[02:04:00.138] https://turborepo.com/docs/telemetry
[02:04:00.138]
[02:04:00.177]  WARNING  Unable to calculate transitive closures: No lockfile entry found for '@emnapi/wasi-threads'
[02:04:00.179] • Packages in scope: web
[02:04:00.179] • Running build in 1 packages
[02:04:00.179] • Remote caching enabled
[02:04:00.320] web:build: cache miss, executing 250107f6a2394001
[02:04:00.378] web:build: $ next build
[02:04:01.602] web:build:    ▲ Next.js 15.5.0
[02:04:01.603] web:build:
[02:04:01.707] web:build:    Creating an optimized production build ...
[02:04:19.035] web:build:  ✓ Compiled successfully in 14.6s
[02:04:19.040] web:build:    Linting and checking validity of types ...
[02:04:30.476] web:build:    Collecting page data ...
[02:04:34.170] web:build:    Generating static pages (0/15) ...
[02:04:35.118] web:build: Error occurred prerendering page "/opengraph-image". Read more: https://nextjs.org/docs/messages/prerender-error
[02:04:35.132] web:build: [Error: Invalid value for CSS property "display". Allowed values: "flex" | "block" | "none" | "-webkit-box". Received: "inline-flex".]
[02:04:35.132] web:build: Export encountered an error on /opengraph-image/route: /opengraph-image, exiting the build.
[02:04:35.169] web:build:  ⨯ Next.js build worker exited with code: 1 and signal: null
[02:04:35.196] web:build: error: script "build" exited with code 1
[02:04:35.197] web:build: ERROR: command finished with error: command (/vercel/path0/apps/web) /bun1/bun run build exited (1)
[02:04:35.197] web#build: command (/vercel/path0/apps/web) /bun1/bun run build exited (1)
[02:04:35.197]
[02:04:35.197]   Tasks:    0 successful, 1 total
[02:04:35.198]  Cached:    0 cached, 1 total
[02:04:35.198]    Time:    35.045s
[02:04:35.198] Summary:    /vercel/path0/.turbo/runs/32QgamimuH9GU5qnpIBUDphLkz8.json
[02:04:35.198]  Failed:    web#build
[02:04:35.198]
[02:04:35.199]  ERROR  run failed: command  exited (1)
[02:04:35.213] Error: Command "turbo run build" exited with 1
