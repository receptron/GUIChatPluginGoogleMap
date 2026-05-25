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
      travelMode: "DRIVING",
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

  // groupId samples — click "Trip A ①→④" in order to watch markers
  // and a route accumulate onto ONE map (they share groupId
  // "tokyo-food-trip"). "Trip B" uses a different groupId, so in the
  // grouped-maps demo it renders as a separate card instead of
  // piling onto the first map.
  {
    name: "Trip A ①: center Shibuya",
    args: {
      action: "showLocation",
      location: "Shibuya, Tokyo",
      groupId: "tokyo-food-trip",
    },
  },
  {
    name: "Trip A ②: + marker Ichiran",
    args: {
      action: "addMarker",
      location: "Ichiran Shibuya",
      markerTitle: "Ichiran",
      markerLabel: "I",
      groupId: "tokyo-food-trip",
    },
  },
  {
    name: "Trip A ③: + marker Hachiko",
    args: {
      action: "addMarker",
      location: "Hachiko Statue, Shibuya",
      markerTitle: "Hachiko",
      markerLabel: "H",
      groupId: "tokyo-food-trip",
    },
  },
  {
    name: "Trip A ④: + walking route",
    args: {
      action: "getDirections",
      origin: "Shibuya Station",
      destination: "Ichiran Shibuya",
      travelMode: "WALKING",
      groupId: "tokyo-food-trip",
    },
  },
  {
    name: "Trip B: Paris (separate map)",
    args: {
      action: "showLocation",
      location: "Eiffel Tower, Paris",
      groupId: "paris-day",
    },
  },
];
