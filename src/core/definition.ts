export const TOOL_NAME = "mapControl";

export const TOOL_DEFINITION = {
  type: "function" as const,
  name: TOOL_NAME,
  description: `Control a Google Map interactively. Supports showing locations, adding markers, searching for places, and getting directions.

Available actions:
- showLocation: Display a location on the map (default action)
- setCenter: Change the map center without markers
- setZoom: Change the zoom level (1-21)
- addMarker: Add a marker to the map
- clearMarkers: Remove all markers from the map
- findPlaces: Search for nearby places using Google Places API
- getDirections: Get directions between two locations`,
  parameters: {
    type: "object" as const,
    properties: {
      action: {
        type: "string",
        enum: [
          "showLocation",
          "setCenter",
          "setZoom",
          "addMarker",
          "clearMarkers",
          "findPlaces",
          "getDirections",
        ],
        description:
          "The action to perform. Defaults to 'showLocation' if not specified.",
      },
      location: {
        type: "string",
        description:
          "Location name, address, or place (e.g., 'Tokyo Station', 'Paris, France'). Used with showLocation, setCenter, addMarker actions.",
      },
      lat: {
        type: "number",
        description:
          "Latitude coordinate. Can be used instead of location for precise positioning.",
      },
      lng: {
        type: "number",
        description:
          "Longitude coordinate. Can be used instead of location for precise positioning.",
      },
      zoom: {
        type: "integer",
        minimum: 1,
        maximum: 21,
        description:
          "Zoom level for setZoom action (1=world, 15=streets, 21=buildings). Default is 15.",
      },
      searchQuery: {
        type: "string",
        description:
          "Text search query for findPlaces action (e.g., 'ramen', 'coffee shop').",
      },
      placeType: {
        type: "string",
        enum: [
          "accounting",
          "airport",
          "amusement_park",
          "aquarium",
          "art_gallery",
          "atm",
          "bakery",
          "bank",
          "bar",
          "beauty_salon",
          "bicycle_store",
          "book_store",
          "bowling_alley",
          "bus_station",
          "cafe",
          "campground",
          "car_dealer",
          "car_rental",
          "car_repair",
          "car_wash",
          "casino",
          "cemetery",
          "church",
          "city_hall",
          "clothing_store",
          "convenience_store",
          "courthouse",
          "dentist",
          "department_store",
          "doctor",
          "drugstore",
          "electrician",
          "electronics_store",
          "embassy",
          "fire_station",
          "florist",
          "funeral_home",
          "furniture_store",
          "gas_station",
          "gym",
          "hair_care",
          "hardware_store",
          "hindu_temple",
          "home_goods_store",
          "hospital",
          "insurance_agency",
          "jewelry_store",
          "laundry",
          "lawyer",
          "library",
          "light_rail_station",
          "liquor_store",
          "local_government_office",
          "locksmith",
          "lodging",
          "meal_delivery",
          "meal_takeaway",
          "mosque",
          "movie_rental",
          "movie_theater",
          "moving_company",
          "museum",
          "night_club",
          "painter",
          "park",
          "parking",
          "pet_store",
          "pharmacy",
          "physiotherapist",
          "plumber",
          "police",
          "post_office",
          "primary_school",
          "real_estate_agency",
          "restaurant",
          "roofing_contractor",
          "rv_park",
          "school",
          "secondary_school",
          "shoe_store",
          "shopping_mall",
          "spa",
          "stadium",
          "storage",
          "store",
          "subway_station",
          "supermarket",
          "synagogue",
          "taxi_stand",
          "tourist_attraction",
          "train_station",
          "transit_station",
          "travel_agency",
          "university",
          "veterinary_care",
          "zoo",
        ],
        description:
          "Type of place to search for with findPlaces action. Use with or instead of searchQuery.",
      },
      origin: {
        type: "string",
        description:
          "Starting point for getDirections action. Can be a place name or address.",
      },
      destination: {
        type: "string",
        description:
          "End point for getDirections action. Can be a place name or address.",
      },
      travelMode: {
        type: "string",
        enum: ["DRIVING", "WALKING", "BICYCLING", "TRANSIT"],
        description:
          "Travel mode for getDirections action. Defaults to DRIVING.",
      },
      markerTitle: {
        type: "string",
        description: "Title for the marker (shown on hover) when using addMarker.",
      },
      markerLabel: {
        type: "string",
        description:
          "Single character label displayed on the marker when using addMarker.",
      },
    },
    required: [],
  },
};
