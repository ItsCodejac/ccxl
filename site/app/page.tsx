function Terminal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800/50 border-b border-neutral-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-neutral-400 font-mono ml-2">{title}</span>
      </div>
      <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto text-neutral-300">
        {children}
      </pre>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Nav */}
      <nav className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-cyan-400">cojac</span> tools
          </span>
          <div className="flex gap-6 text-sm text-neutral-400">
            <a href="#ccxl" className="hover:text-white transition">ccxl</a>
            <a href="#dgent" className="hover:text-white transition">dgent</a>
            <a href="https://github.com/ItsCodejac" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            AI coding tools,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              configured and cleaned.
            </span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            Two CLI tools for developers using AI assistants. One sets them up. The other cleans up after them.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="#ccxl" className="px-6 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition">
              ccxl — Configure
            </a>
            <a href="#dgent" className="px-6 py-3 rounded-lg border border-neutral-700 text-white font-semibold hover:border-neutral-500 transition">
              dgent — Clean
            </a>
          </div>
        </div>
      </section>

      {/* ccxl Section */}
      <section id="ccxl" className="px-6 py-24 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge>ccxl</Badge>
              <h2 className="text-4xl font-bold mt-4 mb-4">Claude Code XL</h2>
              <p className="text-lg text-neutral-400 mb-6">
                One command scans your project and generates complete configs for
                <strong className="text-white"> Claude Code</strong>,
                <strong className="text-white"> Cursor</strong>,
                <strong className="text-white"> GitHub Copilot</strong>, and
                <strong className="text-white"> Windsurf</strong> —
                all tuned to your specific codebase.
              </p>
              <div className="flex gap-3 mb-8">
                <code className="px-3 py-1.5 rounded bg-neutral-800 text-sm font-mono text-cyan-400">
                  npm install -g ccxl
                </code>
              </div>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Interactive TUI wizard with preview before writing</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> 9 project detectors (languages, frameworks, CI, cloud, DBs)</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Skills, hooks, agents, MCP servers generated automatically</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Non-destructive — merges with existing configs</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Community package registry</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Config drift detection and auto-update</li>
              </ul>
            </div>
            <Terminal title="~ ccxl">
{`╭─────────────────────────────────────────╮
│ ccxl v3.1.1                             │
╰─────────────────────────────────────────╯

 `}<span className="text-cyan-400">{"❯"}</span>{` Init         Scan & generate configs
   Generate     Generate specific layers
   Doctor       Run diagnostics
   Update       Check for drift
   Registry     Browse & install packages
   Config       Manage base configs

┌─────────────────────────────────────────┐
│ Project: my-app                         │
│ Configs: `}<span className="text-green-400">{"✓"}</span>{` Claude `}<span className="text-green-400">{"✓"}</span>{` Cursor `}<span className="text-green-400">{"✓"}</span>{` Copilot │
└─────────────────────────────────────────┘`}
            </Terminal>
          </div>
        </div>
      </section>

      {/* What ccxl generates */}
      <section className="px-6 py-16 bg-neutral-900/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">One scan, four tools configured</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Claude Code", files: "settings.json, skills, hooks, agents, MCP, CLAUDE.md", color: "text-orange-400" },
              { name: "Cursor", files: ".cursorrules, .cursor/rules/*.mdc", color: "text-purple-400" },
              { name: "GitHub Copilot", files: "copilot-instructions.md, .github/instructions/", color: "text-blue-400" },
              { name: "Windsurf", files: ".windsurfrules, .windsurf/rules/*.md", color: "text-green-400" },
            ].map((tool) => (
              <div key={tool.name} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900">
                <h4 className={`font-semibold mb-2 ${tool.color}`}>{tool.name}</h4>
                <p className="text-sm text-neutral-400">{tool.files}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* dgent Section */}
      <section id="dgent" className="px-6 py-24 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Terminal title="~ dgent --install">
{`Installing dgent git hooks...

`}<span className="text-green-400">{"✓"}</span>{` pre-commit hook installed
`}<span className="text-green-400">{"✓"}</span>{` commit-msg hook installed

dgent will automatically clean:
  - AI attribution lines from commits
  - "Generated by" comments in code
  - Co-authored-by AI trailers
  - Verbose AI explanations in comments

Run `}<span className="text-cyan-400">dgent check</span>{` to scan existing files.`}
            </Terminal>
            <div>
              <Badge>dgent</Badge>
              <h2 className="text-4xl font-bold mt-4 mb-4">De-agent your code</h2>
              <p className="text-lg text-neutral-400 mb-6">
                Clean AI fingerprints from your commits and code automatically.
                Git hooks that strip AI attribution, generated comments, and
                verbose explanations — so your repo looks like you wrote it.
              </p>
              <div className="flex gap-3 mb-8">
                <code className="px-3 py-1.5 rounded bg-neutral-800 text-sm font-mono text-cyan-400">
                  npm install -g @itscojac/dgent
                </code>
              </div>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Git hooks — runs on every commit automatically</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Strips Co-authored-by AI trailers</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Removes AI-generated comments and markers</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> Works with Claude, Copilot, Cursor, Codex</li>
                <li className="flex gap-2"><span className="text-cyan-400">&#10003;</span> TypeScript, JavaScript, Python support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The workflow */}
      <section className="px-6 py-16 border-t border-neutral-800 bg-neutral-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-8">The workflow</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-3xl mb-3">1.</div>
              <h4 className="font-semibold mb-2">Configure</h4>
              <p className="text-sm text-neutral-400">Run <code className="text-cyan-400">ccxl</code> to set up Claude Code, Cursor, Copilot, and Windsurf for your project</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">2.</div>
              <h4 className="font-semibold mb-2">Code</h4>
              <p className="text-sm text-neutral-400">Use your AI assistants with project-aware configs — better suggestions, proper permissions, custom skills</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">3.</div>
              <h4 className="font-semibold mb-2">Clean</h4>
              <p className="text-sm text-neutral-400">Run <code className="text-cyan-400">dgent</code> to strip AI fingerprints from commits before pushing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-neutral-500">Built by <a href="https://github.com/ItsCodejac" className="text-neutral-400 hover:text-white">Cojac</a></span>
          <div className="flex gap-6 text-sm text-neutral-500">
            <a href="https://www.npmjs.com/package/ccxl" className="hover:text-white transition">ccxl on npm</a>
            <a href="https://www.npmjs.com/package/@itscojac/dgent" className="hover:text-white transition">dgent on npm</a>
            <a href="https://github.com/ItsCodejac/ccxl" className="hover:text-white transition">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
