# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] — Feature Enhancements & UI Redesign

### UI Redesign — Modern Minimalist Style
- New color system: deep charcoal base + indigo accent for a refined, premium look
- Inter + JetBrains Mono typography for crisp readability
- All 18 icons unified as SVG line-style icons
- Toolbar buttons standardized at 32px height with transparent backgrounds
- Smooth page transitions and micro-interactions
- Custom scrollbar and selection highlight colors

### Full-text Search
- Title / Content search mode toggle inside the search box
- Content mode searches all session message content
- Displays highlighted match snippets on session cards
- Batch concurrent loading (10 requests per batch) with real-time progress bar
- Message caching to avoid redundant requests

### Bulk Operations
- Multi-select mode via toolbar checkbox button
- Select All / Deselect All / Cancel
- Batch delete with confirmation dialog
- Batch export to JSON
- Floating action bar at the bottom

### Pagination
- Initial load of 50 sessions
- Auto-loads more on scroll to bottom
- Resets on search/filter/sort changes

### Statistics Enhancement
- New Daily Token Trend chart (line chart, purple)
- Y-axis auto-formats large numbers (k/M)

### Information Enhancement
- Session cards now show message count and session duration
- New message count (green) and duration (yellow) badges

### Keyboard Shortcuts Panel
- Press `?` to open the shortcuts panel
- Grouped display of all keyboard shortcuts
- Close with Esc or click outside

### Bug Fixes
- Fixed refresh button not working in Firefox and strict mode
- Fixed delete modal poor contrast in light theme
- Fixed `session.next.*` event broadcasting
- Fixed missing danger style on card action buttons
- Removed unused CSS variables and dead code

## [0.2.0] — Theme & Navigation

- Dark/light theme switching
- Keyboard navigation support
- Refresh buttons
- Port conflict handling improvements

## [0.1.0] — Initial Release

- Session list and detail views
- Title search, sort, model filter
- Favorites, rename, delete
- Export (Markdown / JSON)
- Clean Mode
- Statistics dashboard
- SSE real-time updates
