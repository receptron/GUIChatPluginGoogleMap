// Map action types
export type MapAction =
  | "showLocation"
  | "setCenter"
  | "setZoom"
  | "addMarker"
  | "clearMarkers"
  | "findPlaces"
  | "getDirections";

// Google Places API supported place types
export type PlaceType =
  | "accounting"
  | "airport"
  | "amusement_park"
  | "aquarium"
  | "art_gallery"
  | "atm"
  | "bakery"
  | "bank"
  | "bar"
  | "beauty_salon"
  | "bicycle_store"
  | "book_store"
  | "bowling_alley"
  | "bus_station"
  | "cafe"
  | "campground"
  | "car_dealer"
  | "car_rental"
  | "car_repair"
  | "car_wash"
  | "casino"
  | "cemetery"
  | "church"
  | "city_hall"
  | "clothing_store"
  | "convenience_store"
  | "courthouse"
  | "dentist"
  | "department_store"
  | "doctor"
  | "drugstore"
  | "electrician"
  | "electronics_store"
  | "embassy"
  | "fire_station"
  | "florist"
  | "funeral_home"
  | "furniture_store"
  | "gas_station"
  | "gym"
  | "hair_care"
  | "hardware_store"
  | "hindu_temple"
  | "home_goods_store"
  | "hospital"
  | "insurance_agency"
  | "jewelry_store"
  | "laundry"
  | "lawyer"
  | "library"
  | "light_rail_station"
  | "liquor_store"
  | "local_government_office"
  | "locksmith"
  | "lodging"
  | "meal_delivery"
  | "meal_takeaway"
  | "mosque"
  | "movie_rental"
  | "movie_theater"
  | "moving_company"
  | "museum"
  | "night_club"
  | "painter"
  | "park"
  | "parking"
  | "pet_store"
  | "pharmacy"
  | "physiotherapist"
  | "plumber"
  | "police"
  | "post_office"
  | "primary_school"
  | "real_estate_agency"
  | "restaurant"
  | "roofing_contractor"
  | "rv_park"
  | "school"
  | "secondary_school"
  | "shoe_store"
  | "shopping_mall"
  | "spa"
  | "stadium"
  | "storage"
  | "store"
  | "subway_station"
  | "supermarket"
  | "synagogue"
  | "taxi_stand"
  | "tourist_attraction"
  | "train_station"
  | "transit_station"
  | "travel_agency"
  | "university"
  | "veterinary_care"
  | "zoo";

// Travel modes for directions
export type TravelMode = "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";

// Latitude/Longitude coordinate
export interface LatLng {
  lat: number;
  lng: number;
}

// Marker data for map display
export interface MarkerData {
  id: string;
  position: LatLng;
  title?: string;
  label?: string;
}

// Place result from Places API search
export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  location: LatLng;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  openNow?: boolean;
  photoUrl?: string;
}

// Route step for directions
export interface DirectionStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
  startLocation?: LatLng;
  endLocation?: LatLng;
}

// Route information from Directions API
export interface DirectionRoute {
  summary: string;
  distance: string;
  duration: string;
  startAddress: string;
  endAddress: string;
  steps: DirectionStep[];
  polyline: string;
}

// Tool data returned from execute function
export interface MapToolData {
  action: MapAction;
  location?: string | LatLng;
  zoom?: number;
  marker?: MarkerData;
  searchQuery?: string;
  placeType?: PlaceType;
  origin?: string | LatLng;
  destination?: string | LatLng;
  travelMode?: TravelMode;
}

// JSON data returned from View component to LLM
export interface MapJsonData {
  action: MapAction;
  success: boolean;
  center?: LatLng;
  zoom?: number;
  markers?: MarkerData[];
  places?: PlaceResult[];
  route?: DirectionRoute;
  error?: string;
}

// Arguments passed to the tool
export interface MapArgs {
  action?: MapAction;
  location?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  searchQuery?: string;
  placeType?: PlaceType;
  origin?: string;
  destination?: string;
  travelMode?: TravelMode;
  markerTitle?: string;
  markerLabel?: string;
}
