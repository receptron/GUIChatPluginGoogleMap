# @gui-chat-plugin/google-map

[![npm version](https://badge.fury.io/js/%40gui-chat-plugin%2Fgoogle-map.svg)](https://www.npmjs.com/package/@gui-chat-plugin/google-map)

Google Map location plugin for GUI Chat applications. Display locations on an interactive map.

## Features

- Show any location by name or address
- Google Maps embed integration
- Fallback link to open in Google Maps
- Support for coordinates (lat/lng)

## Installation

```bash
yarn add @gui-chat-plugin/google-map
```

## Usage

### Vue Integration

```typescript
// In src/tools/index.ts
import MapPlugin from "@gui-chat-plugin/google-map/vue";

const pluginList = [
  // ... other plugins
  MapPlugin,
];

// In src/main.ts
import "@gui-chat-plugin/google-map/style.css";
```

### Core-only Usage

```typescript
import { executeMap, TOOL_DEFINITION } from "@gui-chat-plugin/google-map";

// Show a location
const result = await executeMap(context, {
  location: "Tokyo Tower, Japan",
});
```

## API

### MapArgs

```typescript
interface MapArgs {
  location: string; // Location name, address, or coordinates
}
```

### MapToolData

```typescript
interface MapToolData {
  location: string | { lat: number; lng: number };
}
```

## Google Maps API Setup

This plugin requires a Google Maps API key with several APIs enabled.

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled for the project

### Step 2: Enable Required APIs

This plugin requires the following 4 APIs. Enable all of them:

| API | Purpose | Enable Link |
|-----|---------|-------------|
| **Maps JavaScript API** | Interactive map, markers, controls | [Enable](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com) |
| **Places API (New)** | Search locations by name | [Enable](https://console.cloud.google.com/apis/library/places-backend.googleapis.com) |
| **Directions API** | Route calculation between points | [Enable](https://console.cloud.google.com/apis/library/directions-backend.googleapis.com) |
| **Geocoding API** | Convert addresses to coordinates | [Enable](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com) |

> **Note**: You can use either "Places API" (legacy) or "Places API (New)".

> **Troubleshooting**: If the map doesn't work, check [APIs & Services > Enabled APIs](https://console.cloud.google.com/apis/dashboard) to verify all 4 APIs are enabled. Also check if any API has quota limits or restrictions in its settings.

### Step 3: Create an API Key

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials** > **API key**
3. Copy the generated API key
4. (Recommended) Click **Edit API key** to add restrictions:
   - **Application restrictions**: HTTP referrers (for web apps)
   - **API restrictions**: Restrict to the 4 APIs above

### Step 4: Configure the Plugin

Pass the API key via the `googleMapKey` prop to the view component, or configure it in your app's environment variables / start response.

```env
GOOGLE_MAP_API_KEY=your_api_key_here
```

## Development

```bash
# Install dependencies
yarn install

# Run demo
yarn dev

# Build
yarn build

# Lint
yarn lint
```

## Test Prompts

Try these prompts to test the plugin:

1. "Show me the Eiffel Tower on the map"
2. "Where is the Sydney Opera House located?"
3. "Display Tokyo Station on the map"

## License

MIT
