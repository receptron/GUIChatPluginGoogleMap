import type {
  ToolContext,
  ToolResult,
  ToolPluginCore,
} from "gui-chat-protocol";
import type { MapToolData, MapArgs, MapAction, MapJsonData } from "./types";
import { TOOL_NAME, TOOL_DEFINITION } from "./definition";

const DEFAULT_ACTION: MapAction = "showLocation";
const DEFAULT_ZOOM = 15;
const DEFAULT_TRAVEL_MODE = "DRIVING";

const generateMarkerId = (): string => {
  return `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const validateZoom = (zoom: number): boolean => {
  return Number.isInteger(zoom) && zoom >= 1 && zoom <= 21;
};

const hasLocationParams = (args: MapArgs): boolean => {
  return !!(args.location || (args.lat !== undefined && args.lng !== undefined));
};

const getLocationFromArgs = (
  args: MapArgs
): string | { lat: number; lng: number } | undefined => {
  if (args.lat !== undefined && args.lng !== undefined) {
    return { lat: args.lat, lng: args.lng };
  }
  return args.location;
};

export const executeMapControl = async (
  __context: ToolContext,
  args: MapArgs
): Promise<ToolResult<MapToolData, MapJsonData>> => {
  const action: MapAction = args.action || DEFAULT_ACTION;

  switch (action) {
    case "showLocation":
    case "setCenter":
    case "addMarker": {
      if (!hasLocationParams(args)) {
        throw new Error(
          `${action} requires either 'location' or both 'lat' and 'lng' parameters`
        );
      }
      const location = getLocationFromArgs(args);
      const data: MapToolData = { action, location };

      if (action === "addMarker") {
        data.marker = {
          id: generateMarkerId(),
          position:
            typeof location === "string"
              ? { lat: 0, lng: 0 }
              : (location as { lat: number; lng: number }),
          title: args.markerTitle,
          label: args.markerLabel?.charAt(0),
        };
      }

      const locationStr =
        typeof location === "string" ? location : `${location?.lat}, ${location?.lng}`;
      const messages: Record<string, string> = {
        showLocation: `Showing ${locationStr} on the map`,
        setCenter: `Centering map on ${locationStr}`,
        addMarker: `Adding marker at ${locationStr}`,
      };

      return {
        message: messages[action],
        data,
      };
    }

    case "setZoom": {
      const zoom = args.zoom ?? DEFAULT_ZOOM;
      if (!validateZoom(zoom)) {
        throw new Error("Zoom level must be an integer between 1 and 21");
      }
      return {
        message: `Setting zoom level to ${zoom}`,
        data: { action, zoom },
      };
    }

    case "clearMarkers": {
      return {
        message: "Clearing all markers from the map",
        data: { action },
      };
    }

    case "findPlaces": {
      if (!args.searchQuery && !args.placeType) {
        throw new Error(
          "findPlaces requires either 'searchQuery' or 'placeType' parameter"
        );
      }
      const searchDesc = args.searchQuery
        ? `"${args.searchQuery}"`
        : args.placeType;
      return {
        message: `Searching for ${searchDesc} nearby`,
        data: {
          action,
          searchQuery: args.searchQuery,
          placeType: args.placeType,
        },
      };
    }

    case "getDirections": {
      if (!args.origin || !args.destination) {
        throw new Error(
          "getDirections requires both 'origin' and 'destination' parameters"
        );
      }
      const travelMode = args.travelMode || DEFAULT_TRAVEL_MODE;
      return {
        message: `Getting ${travelMode.toLowerCase()} directions from ${args.origin} to ${args.destination}`,
        data: {
          action,
          origin: args.origin,
          destination: args.destination,
          travelMode,
        },
      };
    }

    default: {
      throw new Error(`Unknown action: ${action}`);
    }
  }
};

export const systemPrompt = `You have access to the mapControl tool for interactive map operations.

## Basic Usage

Show a location:
\`\`\`
mapControl(location: "Tokyo Station")
mapControl(action: "showLocation", location: "Paris, France")
\`\`\`

## Available Actions

### showLocation (default)
Display a location on the map with a marker.
- Use \`location\` for place names/addresses
- Or use \`lat\` and \`lng\` for coordinates

### setCenter
Move the map center without adding markers.
\`\`\`
mapControl(action: "setCenter", location: "Shibuya, Tokyo")
\`\`\`

### setZoom
Change the zoom level (1-21).
- 1-5: Continent/Country level
- 6-10: Region/City level
- 11-15: Street level
- 16-21: Building level
\`\`\`
mapControl(action: "setZoom", zoom: 12)
\`\`\`

### addMarker
Add a marker at a location (without centering).
\`\`\`
mapControl(action: "addMarker", location: "Tokyo Tower", markerTitle: "Tokyo Tower", markerLabel: "T")
\`\`\`

### clearMarkers
Remove all markers from the map.
\`\`\`
mapControl(action: "clearMarkers")
\`\`\`

### findPlaces
Search for nearby places using Google Places API.
\`\`\`
mapControl(action: "findPlaces", searchQuery: "ramen")
mapControl(action: "findPlaces", placeType: "restaurant")
mapControl(action: "findPlaces", searchQuery: "coffee", placeType: "cafe")
\`\`\`

### getDirections
Get directions between two locations.
\`\`\`
mapControl(action: "getDirections", origin: "Tokyo Station", destination: "Tokyo Tower", travelMode: "WALKING")
\`\`\`
Travel modes: DRIVING, WALKING, BICYCLING, TRANSIT

## Response Data

The map will return JSON data with the results of each action, including:
- Current center coordinates and zoom level
- Markers on the map
- Place search results with ratings and addresses
- Route information with distance and duration`;

export const pluginCore: ToolPluginCore<MapToolData, MapJsonData, MapArgs> = {
  toolDefinition: TOOL_DEFINITION,
  execute: executeMapControl,
  generatingMessage: "Loading map...",
  isEnabled: (startResponse) => !!startResponse?.googleMapKey,
  backends: ["map"],
  systemPrompt,
};

export { TOOL_NAME, TOOL_DEFINITION };
export const executeMap = executeMapControl;
