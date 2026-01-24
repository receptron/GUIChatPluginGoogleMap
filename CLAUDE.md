# CLAUDE.md

## Plugin Overview

Google Map location plugin for GUI Chat applications. Displays locations on an interactive Google Map.

## Common Guidelines

For standard plugin development guidelines (Tailwind CSS constraints, build process, npm publish steps), see:
https://github.com/receptron/GUIChatPluginTemplate/blob/main/CLAUDE.md

Key rules from common guidelines:
- Do NOT use Tailwind arbitrary values (JIT syntax like `bg-[#1a1a2e]`, `w-[100px]`)
- Use standard Tailwind classes only (e.g., `bg-slate-900`, `w-24`)

## Plugin-Specific Notes

### Dependencies
- `gui-chat-protocol`: Core protocol for GUI Chat plugins

### External Services
- **Google Maps API**: Requires API key for embedded map display
- API key is passed via `googleMapKey` prop to the View component

### Data Types
```typescript
interface MapArgs {
  location: string; // Location name, address, or coordinates
}

interface MapToolData {
  location: string | { lat: number; lng: number };
}
```

### Key Files
- `src/core/definition.ts`: Tool definition (JSON Schema)
- `src/core/plugin.ts`: Execute function
- `src/vue/View.vue`: Main map display component
- `src/vue/Preview.vue`: Sidebar preview component

### Google Maps API Usage

This plugin uses modern Google Maps JavaScript API:

- **AdvancedMarkerElement**: For map markers (requires `marker` library and `mapId`)
- **Place.searchByText**: For place search functionality (new Places API)
- **Geocoder**: For address-to-coordinates conversion
- **DirectionsService**: For route calculation

Libraries loaded: `places,marker` with `loading=async`

## Updating This Document

**IMPORTANT**: When making spec changes or improvements to this plugin through discussion with Claude:
1. Update this CLAUDE.md to reflect any new constraints, dependencies, or architectural decisions
2. If the change affects common plugin guidelines, also update GUIChatPluginTemplate/CLAUDE.md
3. Keep the "Plugin-Specific Notes" section current with actual implementation

This ensures future Claude sessions have accurate context for this plugin.
