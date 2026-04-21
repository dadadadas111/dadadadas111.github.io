Source: https://code.claude.com/docs/en/sub-agents

The following are verbatim excerpts from the "Create custom subagents" / "Configure subagents" sections of the official Claude Code docs. These examples show supported frontmatter fields, example subagent Markdown, and common invocation patterns (CLI, --agents JSON, Agent(...) allowlist, and @-mention).

---

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

#### Supported frontmatter fields

The following fields can be used in the YAML frontmatter. Only `name` and `description` are required.

| Field             | Required | Description                                                                                                                                                                                                                                                                 |
| :---------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Yes      | Unique identifier using lowercase letters and hyphens                                                                                                                                                                                                                       |
| `description`     | Yes      | When Claude should delegate to this subagent                                                                                                                                                                                                                                |
| `tools`           | No       | [Tools](#available-tools) the subagent can use. Inherits all tools if omitted                                                                                                                                                                                               |
| `disallowedTools` | No       | Tools to deny, removed from inherited or specified list                                                                                                                                                                                                                     |
| `model`           | No       | [Model](#choose-a-model) to use: `sonnet`, `opus`, `haiku`, a full model ID (for example, `claude-opus-4-6`), or `inherit`. Defaults to `inherit`                                                                                                                           |
| `permissionMode`  | No       | [Permission mode](#permission-modes): `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, or `plan`                                                                                                                                                                   |
| `maxTurns`        | No       | Maximum number of agentic turns before the subagent stops                                                                                                                                                                                                                   |
| `skills`          | No       | [Skills](/en/skills) to load into the subagent's context at startup. The full skill content is injected, not just made available for invocation. Subagents don't inherit skills from the parent conversation                                                                |
| `mcpServers`      | No       | [MCP servers](/en/mcp) available to this subagent. Each entry is either a server name referencing an already-configured server (e.g., `"slack"`) or an inline definition with the server name as key and a full [MCP server config](/en/mcp#configure-mcp-servers) as value |
| `hooks`           | No       | [Lifecycle hooks](#define-hooks-for-subagents) scoped to this subagent                                                                                                                                                                                                      |
| `memory`          | No       | [Persistent memory scope](#enable-persistent-memory): `user`, `project`, or `local`. Enables cross-session learning                                                                                                                                                         |
| `background`      | No       | Set to `true` to always run this subagent as a [background task](#run-subagents-in-foreground-or-background). Default: `false`                                                                                                                                              |
| `effort`          | No       | Effort level when this subagent is active. Overrides the session effort level. Default: inherits from session. Options: `low`, `medium`, `high`, `max` (Opus 4.6 only)                                                                                                      |
| `isolation`       | No       | Set to `worktree` to run the subagent in a temporary [git worktree](/en/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees), giving it an isolated copy of the repository. The worktree is automatically cleaned up if the subagent makes no changes     |
| `initialPrompt`   | No       | Auto-submitted as the first user turn when this agent runs as the main session agent (via `--agent` or the `agent` setting). [Commands](/en/commands) and [skills](/en/skills) are processed. Prepended to any user-provided prompt                                         |

---

Example: defining multiple agents via the CLI `--agents` JSON (verbatim example from docs):

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer. Use proactively after code changes.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  },
  "debugger": {
    "description": "Debugging specialist for errors and test failures.",
    "prompt": "You are an expert debugger. Analyze errors, identify root causes, and provide fixes."
  }
}'
```

Example: Agent(...) allowlist in frontmatter (verbatim):

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

Examples of invocation patterns (verbatim snippets):

* @-mention example:

```text
@"code-reviewer (agent)" look at the auth changes
```

* CLI start-session as agent (verbatim):

```bash
claude --agent code-reviewer
```

* Disable an agent via permissions (verbatim CLI example):

```bash
claude --disallowedTools "Agent(Explore)"
```

Source page: https://code.claude.com/docs/en/sub-agents (section: "Create custom subagents" / "Configure subagents")

---

Task tool verbatim reference (from Tools Reference)

```text
TaskCreate           Creates a new task in the task list
TaskGet              Retrieves full details for a specific task
TaskList             Lists all tasks with their current status
TaskOutput           (Deprecated) Retrieves output from a background task. Prefer `Read` on the task's output file path
```

Source page: https://code.claude.com/docs/en/tools-reference (section: "Tools reference")
