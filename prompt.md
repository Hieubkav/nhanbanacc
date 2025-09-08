deploy  lỗi nè 


[01:58:07.323] Running build in Washington, D.C., USA (East) – iad1
[01:58:07.324] Build machine configuration: 2 cores, 8 GB
[01:58:07.401] Cloning github.com/Hieubkav/nhanbanacc (Branch: master, Commit: 6e50cbf)
[01:58:08.357] Cloning completed: 956.000ms
[01:58:12.538] Restored build cache from previous deployment (2kqcta57JZnY6RUnfGrX7jveKpGP)
[01:58:13.047] Running "vercel build"
[01:58:13.430] Vercel CLI 47.0.5
[01:58:13.590] > Detected Turbo. Adjusting default settings...
[01:58:13.733] Running "install" command: `bun install`...
[01:58:13.778] bun install v1.2.21 (7c45ed97)
[01:58:13.810]
[01:58:13.810] Checked 234 installs across 323 packages (no changes) [60.00ms]
[01:58:13.813] Detected Next.js version: 15.5.0
[01:58:13.813] Running "turbo run build"
[01:58:14.053]
[01:58:14.053] Attention:
[01:58:14.053] Turborepo now collects completely anonymous telemetry regarding usage.
[01:58:14.053] This information is used to shape the Turborepo roadmap and prioritize features.
[01:58:14.054] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[01:58:14.054] https://turborepo.com/docs/telemetry
[01:58:14.054]
[01:58:14.094]  WARNING  Unable to calculate transitive closures: No lockfile entry found for '@emnapi/core'
[01:58:14.096] • Packages in scope: web
[01:58:14.096] • Running build in 1 packages
[01:58:14.096] • Remote caching enabled
[01:58:14.238] web:build: cache miss, executing f66b074982cd6008
[01:58:14.243] web:build: $ next build
[01:58:15.351] web:build:    ▲ Next.js 15.5.0
[01:58:15.352] web:build:
[01:58:15.452] web:build:    Creating an optimized production build ...
[01:58:30.812] web:build:  ✓ Compiled successfully in 12.8s
[01:58:30.817] web:build:    Linting and checking validity of types ...
[01:58:41.738] web:build: Failed to compile.
[01:58:41.739] web:build:
[01:58:41.741] web:build: ./src/app/(site)/layout.tsx:38:5
[01:58:41.742] web:build: Type error: Object literal may only specify known properties, and 'themeColor' does not exist in type 'ViewportLayout'.
[01:58:41.742] web:build:
[01:58:41.742] web:build: [0m [90m 36 |[39m     maximumScale[33m:[39m [35m5[39m[33m,[39m
[01:58:41.742] web:build:  [90m 37 |[39m     userScalable[33m:[39m [36mtrue[39m[33m,[39m
[01:58:41.742] web:build: [31m[1m>[22m[39m[90m 38 |[39m     themeColor[33m:[39m [32m"#0ea5e9"[39m[33m,[39m
[01:58:41.742] web:build:  [90m    |[39m     [31m[1m^[22m[39m
[01:58:41.743] web:build:  [90m 39 |[39m   }[33m,[39m
[01:58:41.743] web:build:  [90m 40 |[39m   alternates[33m:[39m {
[01:58:41.743] web:build:  [90m 41 |[39m     canonical[33m:[39m [32m"/"[39m[33m,[39m[0m
[01:58:41.764] web:build: Next.js build worker exited with code: 1 and signal: null
[01:58:41.771] web:build: error: script "build" exited with code 1
[01:58:41.772] web:build: ERROR: command finished with error: command (/vercel/path0/apps/web) /bun1/bun run build exited (1)
[01:58:41.772] web#build: command (/vercel/path0/apps/web) /bun1/bun run build exited (1)
[01:58:41.773]
[01:58:41.773]   Tasks:    0 successful, 1 total
[01:58:41.773]  Cached:    0 cached, 1 total
[01:58:41.773]    Time:    27.704s
[01:58:41.773] Summary:    /vercel/path0/.turbo/runs/32QfsGct74ZWgIlH7V2cUXCzAjl.json
[01:58:41.774]  Failed:    web#build
[01:58:41.775]
[01:58:41.776]  ERROR  run failed: command  exited (1)
[01:58:41.786] Error: Command "turbo run build" exited with 1
