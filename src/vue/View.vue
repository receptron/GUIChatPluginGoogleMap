<template>
  <div class="w-full h-full bg-white flex flex-col relative">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-800">{{ headerTitle }}</h2>
      <p v-if="headerSubtitle" class="text-gray-600 text-sm">{{ headerSubtitle }}</p>
    </div>

    <!-- Main content area -->
    <div class="flex-1 min-h-0 flex">
      <!-- Map container -->
      <div class="flex-1 relative">
        <div
          v-if="googleMapKey"
          ref="mapContainer"
          class="w-full h-full"
        ></div>
        <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
          <div class="text-center p-8">
            <div class="text-gray-500 mb-4">Google Maps API key not configured</div>
            <a
              v-if="fallbackUrl"
              :href="fallbackUrl"
              target="_blank"
              class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        </div>

        <!-- Loading overlay -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center"
        >
          <div class="text-gray-600">Loading...</div>
        </div>

        <!-- Error overlay -->
        <div
          v-if="errorMessage"
          class="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded"
        >
          {{ errorMessage }}
        </div>

        <!-- Zoom controls -->
        <div
          v-if="googleMapKey && map"
          class="absolute top-4 right-4 flex flex-col gap-1"
        >
          <button
            @click="zoomIn"
            class="w-8 h-8 bg-white border border-gray-300 rounded shadow text-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
            title="Zoom in"
          >
            +
          </button>
          <button
            @click="zoomOut"
            class="w-8 h-8 bg-white border border-gray-300 rounded shadow text-lg font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
            title="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      <!-- Side panel for search results or directions -->
      <div
        v-if="showSidePanel"
        class="w-80 border-l border-gray-200 overflow-y-auto"
      >
        <!-- Place search results -->
        <div v-if="places.length > 0" class="p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Search Results</h3>
          <div class="space-y-3">
            <div
              v-for="place in places"
              :key="place.placeId"
              class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              @click="selectPlace(place)"
            >
              <div class="font-medium text-gray-800">{{ place.name }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ place.address }}</div>
              <div v-if="place.rating" class="flex items-center mt-1">
                <span class="text-yellow-500 mr-1">★</span>
                <span class="text-sm text-gray-600">
                  {{ place.rating.toFixed(1) }}
                  <span v-if="place.userRatingsTotal" class="text-gray-400">
                    ({{ place.userRatingsTotal }})
                  </span>
                </span>
              </div>
              <div
                v-if="place.openNow !== undefined"
                :class="place.openNow ? 'text-green-600' : 'text-red-600'"
                class="text-sm mt-1"
              >
                {{ place.openNow ? "Open now" : "Closed" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Directions info -->
        <div v-if="route" class="p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Directions</h3>
          <div class="bg-blue-50 rounded-lg p-3 mb-4">
            <div class="text-lg font-medium text-gray-800">{{ route.distance }}</div>
            <div class="text-gray-600">{{ route.duration }}</div>
          </div>
          <div class="text-sm text-gray-600 mb-3">
            <div><strong>From:</strong> {{ route.startAddress }}</div>
            <div><strong>To:</strong> {{ route.endAddress }}</div>
          </div>
          <div class="space-y-2">
            <div
              v-for="(step, index) in route.steps"
              :key="index"
              class="p-2 bg-gray-50 rounded text-sm"
            >
              <div class="text-gray-800">{{ stripHtml(step.instruction) }}</div>
              <div class="text-gray-500 mt-1">
                {{ step.distance }} · {{ step.duration }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { ToolResult } from "gui-chat-protocol";
import type {
  MapToolData,
  MapJsonData,
  MarkerData,
  PlaceResult,
  DirectionRoute,
  LatLng,
} from "../core/types";

const props = defineProps<{
  selectedResult: ToolResult<MapToolData> | null;
  googleMapKey?: string | null;
  onUpdateResult?: (jsonData: MapJsonData) => void;
}>();

// State
const mapContainer = ref<HTMLDivElement | null>(null);
const map = ref<google.maps.Map | null>(null);
const markers = ref<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
const directionsService = ref<google.maps.DirectionsService | null>(null);
const directionsRenderer = ref<google.maps.DirectionsRenderer | null>(null);
const geocoder = ref<google.maps.Geocoder | null>(null);

// Library references (loaded dynamically)
let AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
let Place: typeof google.maps.places.Place;

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const places = ref<PlaceResult[]>([]);
const route = ref<DirectionRoute | null>(null);
const currentCenter = ref<LatLng | null>(null);
const currentZoom = ref(15);

// Computed
const headerTitle = computed(() => {
  const action = props.selectedResult?.data?.action;
  const titles: Record<string, string> = {
    showLocation: "Map Location",
    setCenter: "Map View",
    setZoom: "Map View",
    addMarker: "Map Marker",
    clearMarkers: "Map",
    findPlaces: "Place Search",
    getDirections: "Directions",
  };
  return titles[action || "showLocation"] || "Map";
});

const headerSubtitle = computed(() => {
  const data = props.selectedResult?.data;
  if (!data) return "";

  switch (data.action) {
    case "showLocation":
    case "setCenter":
    case "addMarker":
      return formatLocation(data.location);
    case "setZoom":
      return `Zoom level: ${data.zoom}`;
    case "findPlaces":
      return data.searchQuery || data.placeType || "";
    case "getDirections":
      return `${data.origin} → ${data.destination}`;
    default:
      return "";
  }
});

const showSidePanel = computed(() => {
  return places.value.length > 0 || route.value !== null;
});

const fallbackUrl = computed(() => {
  const data = props.selectedResult?.data;
  if (!data?.location) return "";
  const loc = formatLocation(data.location);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
});

// Helper functions
const formatLocation = (
  location: string | LatLng | undefined
): string => {
  if (!location) return "";
  if (typeof location === "string") return location;
  return `${location.lat}, ${location.lng}`;
};

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const getMarkersData = (): MarkerData[] => {
  const result: MarkerData[] = [];
  markers.value.forEach((marker, id) => {
    const position = marker.position;
    if (position) {
      const lat = typeof position.lat === "function" ? position.lat() : position.lat;
      const lng = typeof position.lng === "function" ? position.lng() : position.lng;
      result.push({
        id,
        position: { lat, lng },
        title: marker.title || undefined,
      });
    }
  });
  return result;
};

const emitResult = (
  success: boolean,
  error?: string,
  additionalData?: Partial<MapJsonData>
) => {
  if (!props.onUpdateResult) return;

  const data = props.selectedResult?.data;
  const jsonData: MapJsonData = {
    action: data?.action || "showLocation",
    success,
    center: currentCenter.value || undefined,
    zoom: currentZoom.value,
    markers: getMarkersData(),
    ...additionalData,
  };

  if (error) {
    jsonData.error = error;
  }

  props.onUpdateResult(jsonData);
};

// Map initialization
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already fully loaded with importLibrary available
    if (
      typeof google !== "undefined" &&
      google.maps &&
      typeof google.maps.importLibrary === "function"
    ) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );

    const TIMEOUT_MS = 10000;
    const POLL_INTERVAL_MS = 50;

    const waitForImportLibrary = (startTime: number) => {
      if (
        typeof google !== "undefined" &&
        google.maps &&
        typeof google.maps.importLibrary === "function"
      ) {
        resolve();
      } else if (Date.now() - startTime > TIMEOUT_MS) {
        reject(new Error("Timeout waiting for Google Maps to load"));
      } else {
        setTimeout(() => waitForImportLibrary(startTime), POLL_INTERVAL_MS);
      }
    };

    if (existingScript) {
      waitForImportLibrary(Date.now());
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.googleMapKey}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => waitForImportLibrary(Date.now());
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
};

const initializeMap = async () => {
  if (!mapContainer.value || !props.googleMapKey) return;

  // Skip if map is already initialized
  if (map.value) return;

  try {
    await loadGoogleMapsScript();

    // Load libraries dynamically
    const markerLib = (await google.maps.importLibrary(
      "marker"
    )) as google.maps.MarkerLibrary;
    const placesLib = (await google.maps.importLibrary(
      "places"
    )) as google.maps.PlacesLibrary;
    AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
    Place = placesLib.Place;

    const defaultCenter = { lat: 35.6812, lng: 139.7671 }; // Tokyo Station
    map.value = new google.maps.Map(mapContainer.value, {
      center: defaultCenter,
      zoom: currentZoom.value,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      // DEMO_MAP_ID is Google's demo ID. For production, create your own at:
      // https://console.cloud.google.com/google/maps-apis/studio/maps
      mapId: "DEMO_MAP_ID",
    });

    geocoder.value = new google.maps.Geocoder();
    directionsService.value = new google.maps.DirectionsService();
    directionsRenderer.value = new google.maps.DirectionsRenderer();
    directionsRenderer.value.setMap(map.value);

    map.value.addListener("center_changed", () => {
      const center = map.value?.getCenter();
      if (center) {
        currentCenter.value = { lat: center.lat(), lng: center.lng() };
      }
    });

    map.value.addListener("zoom_changed", () => {
      currentZoom.value = map.value?.getZoom() || 15;
    });

    // Process initial action if data exists
    if (props.selectedResult?.data) {
      await handleAction(props.selectedResult.data);
    }
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "Failed to initialize map";
  }
};

// Action handlers
const geocodeLocation = async (
  location: string | LatLng
): Promise<LatLng | null> => {
  if (typeof location !== "string") {
    return location;
  }

  if (!geocoder.value) return null;

  return new Promise((resolve) => {
    geocoder.value!.geocode(
      { address: location },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve({ lat: loc.lat(), lng: loc.lng() });
        } else {
          resolve(null);
        }
      }
    );
  });
};

const addMapMarker = (
  position: LatLng,
  id: string,
  title?: string,
  label?: string
): google.maps.marker.AdvancedMarkerElement => {
  // Create label element if needed
  let content: HTMLElement | undefined;
  if (label) {
    const labelDiv = document.createElement("div");
    labelDiv.className = "marker-label";
    labelDiv.style.cssText = "background: #4285f4; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;";
    labelDiv.textContent = label;
    content = labelDiv;
  }

  const marker = new AdvancedMarkerElement({
    position,
    map: map.value,
    title,
    content,
  });

  markers.value.set(id, marker);
  return marker;
};

const clearAllMarkers = () => {
  markers.value.forEach((marker) => {
    marker.map = null;
  });
  markers.value.clear();
};

const handleAction = async (data: MapToolData) => {
  if (!map.value) return;

  isLoading.value = true;
  errorMessage.value = null;

  try {
    switch (data.action) {
      case "showLocation":
      case "setCenter": {
        if (!data.location) {
          throw new Error("Location is required");
        }
        const coords = await geocodeLocation(data.location);
        if (!coords) {
          throw new Error("Could not find location");
        }
        map.value.setCenter(coords);
        currentCenter.value = coords;

        if (data.action === "showLocation") {
          const markerId = `location_${Date.now()}`;
          addMapMarker(
            coords,
            markerId,
            typeof data.location === "string" ? data.location : undefined
          );
        }
        emitResult(true);
        break;
      }

      case "setZoom": {
        const zoom = data.zoom || 15;
        map.value.setZoom(zoom);
        currentZoom.value = zoom;
        emitResult(true);
        break;
      }

      case "addMarker": {
        if (!data.location) {
          throw new Error("Location is required for marker");
        }
        const coords = await geocodeLocation(data.location);
        if (!coords) {
          throw new Error("Could not find location for marker");
        }
        const markerId = data.marker?.id || `marker_${Date.now()}`;
        addMapMarker(coords, markerId, data.marker?.title, data.marker?.label);
        emitResult(true);
        break;
      }

      case "clearMarkers": {
        clearAllMarkers();
        directionsRenderer.value?.setDirections({
          routes: [],
          request: {} as google.maps.DirectionsRequest,
        } as google.maps.DirectionsResult);
        places.value = [];
        route.value = null;
        emitResult(true);
        break;
      }

      case "findPlaces": {
        await searchPlaces(data.searchQuery, data.placeType);
        break;
      }

      case "getDirections": {
        if (!data.origin || !data.destination) {
          throw new Error("Origin and destination are required");
        }
        await getDirections(
          data.origin as string,
          data.destination as string,
          data.travelMode || "DRIVING"
        );
        break;
      }
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An error occurred";
    errorMessage.value = message;
    emitResult(false, message);
  } finally {
    isLoading.value = false;
  }
};

const searchPlaces = async (query?: string, placeType?: string) => {
  if (!map.value || !Place) return;

  const center = map.value.getCenter();
  if (!center) return;

  try {
    // Use new Place.searchByText API
    const request: google.maps.places.SearchByTextRequest = {
      textQuery: query || placeType || "",
      locationBias: {
        center: { lat: center.lat(), lng: center.lng() },
        radius: 5000,
      },
      fields: ["id", "displayName", "formattedAddress", "location", "rating", "userRatingCount", "types", "regularOpeningHours"],
      maxResultCount: 10,
    };

    if (placeType && !query) {
      request.includedType = placeType;
    }

    const { places: searchResults } = await Place.searchByText(request);

    if (searchResults && searchResults.length > 0) {
      // Clear previous place markers (collect IDs first to avoid mutation during iteration)
      const placeMarkerIds = [...markers.value.keys()].filter((id) =>
        id.startsWith("place_")
      );
      placeMarkerIds.forEach((id) => {
        const marker = markers.value.get(id);
        if (marker) {
          marker.map = null;
          markers.value.delete(id);
        }
      });

      const placeResults: PlaceResult[] = searchResults.map(
        (place: google.maps.places.Place, index: number) => {
          const location = place.location;
          const coords: LatLng = location
            ? { lat: location.lat(), lng: location.lng() }
            : { lat: 0, lng: 0 };

          // Add marker for each place
          if (location) {
            addMapMarker(
              coords,
              `place_${place.id}`,
              place.displayName || undefined,
              String(index + 1)
            );
          }

          return {
            placeId: place.id || "",
            name: place.displayName || "",
            address: place.formattedAddress || "",
            location: coords,
            rating: place.rating ?? undefined,
            userRatingsTotal: place.userRatingCount ?? undefined,
            types: place.types,
            // Note: isOpen() requires async call, omitting for now
            openNow: undefined,
          };
        }
      );

      places.value = placeResults;
      route.value = null;

      // Fit bounds to show all markers
      if (placeResults.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        placeResults.forEach((p) => {
          bounds.extend(p.location);
        });
        map.value?.fitBounds(bounds);
      }

      emitResult(true, undefined, { places: placeResults });
    } else {
      emitResult(false, "No places found");
    }
  } catch {
    emitResult(false, "No places found");
  }
};

const getDirections = async (
  origin: string,
  destination: string,
  travelMode: string
) => {
  if (!directionsService.value || !directionsRenderer.value) return;

  const request: google.maps.DirectionsRequest = {
    origin,
    destination,
    travelMode: travelMode as google.maps.TravelMode,
  };

  return new Promise<void>((resolve) => {
    directionsService.value!.route(
      request,
      (
        result: google.maps.DirectionsResult | null,
        status: google.maps.DirectionsStatus
      ) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.value!.setDirections(result);

          const leg = result.routes[0]?.legs[0];
          if (leg) {
            const routeInfo: DirectionRoute = {
              summary: result.routes[0].summary || "",
              distance: leg.distance?.text || "",
              duration: leg.duration?.text || "",
              startAddress: leg.start_address || "",
              endAddress: leg.end_address || "",
              steps: leg.steps?.map((step: google.maps.DirectionsStep) => ({
                instruction: step.instructions || "",
                distance: step.distance?.text || "",
                duration: step.duration?.text || "",
                travelMode: step.travel_mode || "",
              })) || [],
              polyline: result.routes[0].overview_polyline || "",
            };

            route.value = routeInfo;
            places.value = [];

            emitResult(true, undefined, { route: routeInfo });
          }
        } else {
          emitResult(false, "Could not find directions");
        }
        resolve();
      }
    );
  });
};

const selectPlace = (place: PlaceResult) => {
  if (!map.value) return;
  map.value.setCenter(place.location);
  map.value.setZoom(17);
};

const zoomIn = () => {
  if (!map.value) return;
  const current = map.value.getZoom() || 15;
  if (current < 21) {
    map.value.setZoom(current + 1);
  }
};

const zoomOut = () => {
  if (!map.value) return;
  const current = map.value.getZoom() || 15;
  if (current > 1) {
    map.value.setZoom(current - 1);
  }
};

// Track last processed data to avoid re-processing
let lastProcessedData: string | null = null;

// Watch for result changes
watch(
  () => props.selectedResult?.data,
  async (newData) => {
    if (newData && map.value) {
      // Skip if same data was already processed
      const dataKey = JSON.stringify(newData);
      if (dataKey === lastProcessedData) return;
      lastProcessedData = dataKey;
      await handleAction(newData);
    }
  }
);

// Lifecycle
onMounted(() => {
  if (props.googleMapKey) {
    initializeMap();
  }
});

onUnmounted(() => {
  clearAllMarkers();
});
</script>
