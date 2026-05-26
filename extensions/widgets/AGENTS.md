# AGENTS.md — widgets/

## Purpose

This directory contains UI components for the pi-goal extension. Widgets render goal state in the terminal UI (TUI) above the conversation.

## Architecture

### Files

| File | Exports | Purpose |
|------|---------|---------|
| `goal-widget.ts` | `GoalWidgetComponent`, `renderGoalWidgetLines`, `renderAuditorWidgetLines`, `GoalWidgetOptions`, `GoalWidgetRecord`, `AuditorWidgetProgress` | Main goal beacon component. Renders focused goal status, blocker info, and auditor progress |
| `goal-notifications.ts` | `buildGoalRunningNotification` | Lifecycle toast notifications. Provides text for goal start/pause/complete/abort events |

### GoalWidgetComponent

The main component class implementing the pi-tui `Component` interface:

```ts
export class GoalWidgetComponent implements Component {
  constructor(options: GoalWidgetOptions)
  render(width: number): string[]  // Returns lines to display
  update(): void                   // Requests TUI re-render
  invalidate(): void               // Triggers render (alias for update)
}
```

### Rendering Functions

| Function | Visibility | Purpose |
|----------|------------|--------|
| `renderGoalWidgetLines(goal, theme, width, options)` | Exported | Main renderer. Returns array of display lines |
| `renderAuditorWidgetLines(progress, theme, width)` | Exported | Auditor progress overlay. Replaces goal widget during audit |
| `displayIcon(goal)` | Private | Returns icon, color, and label for goal status |
| `heading(theme, width, left, right)` | Private | Renders a header line with left/right parts |
| `branchLine(theme, width, isLast, content)` | Private | Renders a tree-branch prefixed line |

### Display States

| State | Icon | Color | Label |
|-------|------|-------|-------|
| Active + auto | ● | accent | "goal running" |
| Active + manual | ○ | muted | "goal idle" |
| Paused (agent) | ⊘ | warning | "blocked" |
| Paused (user) | ◐ | muted | "paused" |
| Complete | ✓ | success | "complete" |
| Sisyphus + auto | ◆ | accent | "sisyphus running" |
| Sisyphus + manual | ◆ | muted | "sisyphus idle" |

## Opinionated Conventions

### Renderer is Stateless

`renderGoalWidgetLines` is a pure function that takes all state as arguments. The class wraps state accessors:

```ts
render(width: number): string[] {
  return renderGoalWidgetLines(this.getGoal(), this.theme, width, {
    openGoalCount: this.getOpenGoalCount(),
    auditorProgress: this.getAuditorProgress(),
  });
}
```

This makes the renderer testable without mocking the TUI or component lifecycle.

### Auditor Takes Priority

When auditor progress is available, the widget renders auditor state instead of goal state:

```ts
if (options.auditorProgress) {
  return renderAuditorWidgetLines(options.auditorProgress, ...);
}
```

The auditor overlay shows:
- Spinner + "Audit" label + elapsed time
- Current tool call with arguments and duration
- Recent output lines
- "Esc to skip" hint

### Theme Colors are Explicit

Widget uses a restricted color palette:
- `accent`: Primary actions, active states
- `success`: Complete status
- `warning`: Blocker, attention needed
- `error`: Failure states
- `dim`: Decorative elements, separators
- `muted`: Secondary labels, metadata
- `text`: Main content

Never use arbitrary colors. The theme system handles terminal compatibility.

### Spinner Animation

The spinner uses a fixed frame rate (80ms interval) and wraps `Date.now()`:

```ts
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
function spinnerFrame(): string {
  return SPINNER[Math.floor(Date.now() / 80) % SPINNER.length];
}
```

This avoids timer management and provides smooth animation on every render.

### Width Handling

All width calculations use `visibleWidth` (not string length) to handle Unicode properly:

```ts
const safeWidth = Math.max(1, width);
const titleWidth = Math.max(12, safeWidth - 8);
```

Minimum widths prevent negative or zero allocations.

## Notifications vs Widgets

- **Widget**: Persistent display above conversation, shows current goal state
- **Notification**: Ephemeral toast for lifecycle transitions (start, pause, complete, abort)

Notifications are built from `goal-notifications.ts` and displayed by the runtime using pi's notification system. Widgets are registered with the TUI and update reactively.

## Testing Notes

Widget rendering is testable because it's pure functions:
- Snapshot test `renderGoalWidgetLines` output for each state
- Test icon/color combinations for all status variants
- Test width truncation and ellipsis behavior
- Test auditor overlay appearance
- Use `theme.fg()` mocking for color validation