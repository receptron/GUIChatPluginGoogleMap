<template>
  <div class="text-center p-4 rounded" :class="backgroundClass">
    <div class="font-medium" :class="labelClass">{{ actionLabel }}</div>
    <div class="text-xs text-gray-600 mt-1 truncate">{{ summary }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ToolResult } from "gui-chat-protocol";
import type { MapToolData, LatLng } from "../core/types";

const props = defineProps<{
  result: ToolResult<MapToolData>;
}>();

const formatLocation = (location: string | LatLng | undefined): string => {
  if (!location) return "";
  if (typeof location === "string") return location;
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
};

const actionLabel = computed(() => {
  const action = props.result.data?.action;
  const labels: Record<string, string> = {
    showLocation: "Map Location",
    setCenter: "Center Map",
    setZoom: "Zoom",
    addMarker: "Add Marker",
    clearMarkers: "Clear Markers",
    findPlaces: "Place Search",
    getDirections: "Directions",
  };
  return labels[action || "showLocation"] || "Map";
});

const summary = computed(() => {
  const data = props.result.data;
  if (!data) return "";

  switch (data.action) {
    case "showLocation":
    case "setCenter":
    case "addMarker":
      return formatLocation(data.location);
    case "setZoom":
      return `Level ${data.zoom}`;
    case "clearMarkers":
      return "All markers cleared";
    case "findPlaces":
      return data.searchQuery || data.placeType || "Search";
    case "getDirections": {
      const origin =
        typeof data.origin === "string" ? data.origin : "Start";
      const dest =
        typeof data.destination === "string" ? data.destination : "End";
      return `${origin} → ${dest}`;
    }
    default:
      return formatLocation(data.location);
  }
});

const backgroundClass = computed(() => {
  const action = props.result.data?.action;
  const classes: Record<string, string> = {
    showLocation: "bg-blue-50",
    setCenter: "bg-blue-50",
    setZoom: "bg-purple-50",
    addMarker: "bg-green-50",
    clearMarkers: "bg-gray-50",
    findPlaces: "bg-yellow-50",
    getDirections: "bg-orange-50",
  };
  return classes[action || "showLocation"] || "bg-blue-50";
});

const labelClass = computed(() => {
  const action = props.result.data?.action;
  const classes: Record<string, string> = {
    showLocation: "text-blue-600",
    setCenter: "text-blue-600",
    setZoom: "text-purple-600",
    addMarker: "text-green-600",
    clearMarkers: "text-gray-600",
    findPlaces: "text-yellow-700",
    getDirections: "text-orange-600",
  };
  return classes[action || "showLocation"] || "text-blue-600";
});
</script>
