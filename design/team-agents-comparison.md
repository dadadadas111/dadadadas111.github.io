Team Agents vs Claude Code Sub-agents — concise mapping and API sketch

What: a compact comparison table mapping Claude Code sub-agent capabilities to features expected from "team agents", followed by a one-page API/design sketch for team-agents addressing gaps.

Comparison (left = sub-agent capability, right = team-agent requirement)

- Spawn mechanism: Agent(...) tool (Task alias) → Team: explicit multi-agent registry + discoverable endpoints
- Declaration: Markdown frontmatter in .claude/agents/ and other locations → Team: central manifest + dynamic registration API
- Isolation: isolated context windows per sub-agent → Team: configurable isolation with optional shared memory channels
- Lifecycle: SubagentStart/SubagentStop → Team: extended lifecycle events (Join/Leave/Heartbeat/Failover)
- Communication: Parent-mediated only; no P2P → Team: direct P2P channels, pub/sub, shared channels
- Nesting: Not supported (no subagent spawning) → Team: nested spawning & hierarchical groups
- Hooks: PreToolUse/PostToolUse/SubagentStart/SubagentStop → Team: cross-agent hooks and federated hook dispatch
- Memory: per-agent/memory scopes → Team: shared team memory, access controls, and memory partitioning
- Permissions: permissionMode + upfront permissions for background tasks → Team: fine-grained RBAC, capability tokens, scoped permissions
- Observability: docs only; no IPC schemas → Team: observable event stream, message schemas, and audit logs

API/design sketch (one page)

1) Agent Registry
- POST /v1/agents/register — register an agent (id, type, capabilities, manifest)
- GET /v1/agents — list agents and capability filters

2) Messaging
- POST /v1/agents/{agent_id}/messages — deliver message to agent (from, to, channel, payload, metadata)
- Websocket /v1/agents/{agent_id}/ws — real-time channel for agent (events, messages, heartbeats)
- Channels: direct, group, pubsub topics. Channels have ACLs.

3) Lifecycle & Control
- POST /v1/agents/{agent_id}/spawn — spawn agent (manifest, mode=foreground|background, permissionGrant)
- POST /v1/agents/{agent_id}/stop — stop/terminate
- GET /v1/agents/{agent_id}/status — health, last_heartbeat, mode

4) Permissions & Auth
- Scoped tokens: team:read, team:write, agent:spawn, agent:message, memory:read, memory:write
- Permission grants for background tasks: upfront permission grant endpoint

5) Memory & Shared Stores
- GET/POST /v1/teams/{team_id}/memory/{scope} — read/write shared memory; access controlled by ACLs
- Memory events: memory.write, memory.read (hookable)

6) Events & Observability
- Event stream via websocket or HTTP webhook subscriptions: agent.join, agent.leave, message.sent, message.received, tool.call, tool.result, agent.error
- Event schemas (JSON Schema) published in the API docs for instrumentation and testing

7) Message Schema (compact)
{
  "id": "uuid",
  "from": "agent_id",
  "to": "agent_id|channel_id",
  "channel": "direct|group|topic",
  "type": "text|json|tool_call|control",
  "payload": {"..."},
  "timestamp": "iso8601",
  "meta": {"permission_grant_id": "..."}
}

Risks & Notes
- Backwards compatibility with existing Agent(...) tool must be preserved via adapter
- Security: exposing P2P channels requires rate limits and per-channel ACLs
- Implementation options: brokered (central server) vs mesh (peer connect); start with brokered for simplicity

Next steps
- Produce a more detailed API spec (endpoints, request/response shapes, auth flows) if needed.
