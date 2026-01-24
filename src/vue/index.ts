import "../style.css";

import type { ToolPlugin } from "gui-chat-protocol/vue";
import type { MapToolData, MapJsonData, MapArgs } from "../core/types";
import { pluginCore } from "../core/plugin";
import { samples } from "../core/samples";
import View from "./View.vue";
import Preview from "./Preview.vue";

export const plugin: ToolPlugin<MapToolData, MapJsonData, MapArgs> = {
  ...pluginCore,
  viewComponent: View,
  previewComponent: Preview,
  samples,
};

export type {
  MapToolData,
  MapJsonData,
  MapArgs,
  MapAction,
  PlaceType,
  TravelMode,
  LatLng,
  MarkerData,
  PlaceResult,
  DirectionRoute,
  DirectionStep,
} from "../core/types";

export {
  TOOL_NAME,
  TOOL_DEFINITION,
  executeMap,
  pluginCore,
} from "../core/plugin";

export { samples } from "../core/samples";

export { View, Preview };

export default { plugin };
