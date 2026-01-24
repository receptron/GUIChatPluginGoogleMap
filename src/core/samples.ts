import type { ToolSample } from "gui-chat-protocol";

export const samples: ToolSample[] = [
  // showLocation samples
  {
    name: "Show Tokyo Station",
    args: {
      action: "showLocation",
      location: "Tokyo Station, Japan",
    },
  },
  {
    name: "Show Eiffel Tower",
    args: {
      action: "showLocation",
      location: "Eiffel Tower, Paris, France",
    },
  },
  {
    name: "Show coordinates",
    args: {
      action: "showLocation",
      lat: 40.7128,
      lng: -74.006,
    },
  },

  // setCenter samples
  {
    name: "Center on Shibuya",
    args: {
      action: "setCenter",
      location: "Shibuya, Tokyo",
    },
  },

  // setZoom samples
  {
    name: "Zoom to street level",
    args: {
      action: "setZoom",
      zoom: 17,
    },
  },
  {
    name: "Zoom to city level",
    args: {
      action: "setZoom",
      zoom: 12,
    },
  },

  // addMarker samples
  {
    name: "Add marker at Tokyo Tower",
    args: {
      action: "addMarker",
      location: "Tokyo Tower, Japan",
      markerTitle: "Tokyo Tower",
      markerLabel: "T",
    },
  },
  {
    name: "Add marker with coordinates",
    args: {
      action: "addMarker",
      lat: 35.6586,
      lng: 139.7454,
      markerTitle: "Custom Location",
    },
  },

  // clearMarkers sample
  {
    name: "Clear all markers",
    args: {
      action: "clearMarkers",
    },
  },

  // findPlaces samples
  {
    name: "Find nearby ramen",
    args: {
      action: "findPlaces",
      searchQuery: "ramen",
    },
  },
  {
    name: "Find restaurants",
    args: {
      action: "findPlaces",
      placeType: "restaurant",
    },
  },
  {
    name: "Find coffee shops",
    args: {
      action: "findPlaces",
      searchQuery: "coffee",
      placeType: "cafe",
    },
  },

  // getDirections samples
  {
    name: "Directions: Tokyo Station to Shibuya",
    args: {
      action: "getDirections",
      origin: "Tokyo Station",
      destination: "Shibuya Station",
      travelMode: "TRANSIT",
    },
  },
  {
    name: "Walking directions",
    args: {
      action: "getDirections",
      origin: "Shinjuku Station",
      destination: "Tokyo Metropolitan Government Building",
      travelMode: "WALKING",
    },
  },
  {
    name: "Driving directions",
    args: {
      action: "getDirections",
      origin: "Narita Airport",
      destination: "Tokyo Station",
      travelMode: "DRIVING",
    },
  },
];
