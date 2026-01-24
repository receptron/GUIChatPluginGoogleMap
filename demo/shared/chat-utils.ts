/**
 * Shared chat utilities for Vue demo
 */
import OpenAI from "openai";
import type { ToolDefinition, ToolContext, ToolResult } from "gui-chat-protocol";
import type { ChatMessage, MockResponse } from "./chat-types";

/**
 * Load API key from environment variable (Vite)
 */
export const loadApiKey = (): string => {
  return import.meta.env?.VITE_OPENAI_API_KEY || "";
};

/**
 * Default mock responses for development without API key
 */
export const DEFAULT_MOCK_RESPONSES: Record<string, MockResponse> = {
  tokyo: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "showLocation",
        location: "Tokyo Station, Japan",
      },
    },
  },
  shibuya: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "showLocation",
        location: "Shibuya, Tokyo",
      },
    },
  },
  zoom_in: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "setZoom",
        zoom: 18,
      },
    },
  },
  zoom_out: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "setZoom",
        zoom: 10,
      },
    },
  },
  marker: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "addMarker",
        location: "Tokyo Tower, Japan",
        markerTitle: "Tokyo Tower",
        markerLabel: "T",
      },
    },
  },
  clear: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "clearMarkers",
      },
    },
  },
  ramen: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "findPlaces",
        searchQuery: "ramen",
      },
    },
  },
  directions: {
    toolCall: {
      name: "mapControl",
      args: {
        action: "getDirections",
        origin: "Tokyo Station",
        destination: "Tokyo Tower",
        travelMode: "WALKING",
      },
    },
  },
  hello: {
    content:
      "Hello! I can help you explore maps. Try saying 'show Tokyo Station' or 'find ramen nearby'.",
  },
  default: {
    content:
      "I can help you with maps. Try commands like 'show [location]', 'zoom in/out', 'add marker', 'find [place]', or 'directions from A to B'.",
  },
};

/**
 * Find matching mock response based on user message
 */
export const findMockResponse = (
  userMessage: string,
  mockResponses: Record<string, MockResponse> = DEFAULT_MOCK_RESPONSES
): MockResponse => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("tokyo") && !lowerMessage.includes("tower")) {
    return mockResponses.tokyo || DEFAULT_MOCK_RESPONSES.tokyo;
  }
  if (lowerMessage.includes("shibuya")) {
    return mockResponses.shibuya || DEFAULT_MOCK_RESPONSES.shibuya;
  }
  if (lowerMessage.includes("zoom in") || lowerMessage.includes("closer")) {
    return mockResponses.zoom_in || DEFAULT_MOCK_RESPONSES.zoom_in;
  }
  if (lowerMessage.includes("zoom out") || lowerMessage.includes("wider")) {
    return mockResponses.zoom_out || DEFAULT_MOCK_RESPONSES.zoom_out;
  }
  if (lowerMessage.includes("marker") || lowerMessage.includes("tower")) {
    return mockResponses.marker || DEFAULT_MOCK_RESPONSES.marker;
  }
  if (lowerMessage.includes("clear") || lowerMessage.includes("remove")) {
    return mockResponses.clear || DEFAULT_MOCK_RESPONSES.clear;
  }
  if (lowerMessage.includes("ramen") || lowerMessage.includes("food") || lowerMessage.includes("find")) {
    return mockResponses.ramen || DEFAULT_MOCK_RESPONSES.ramen;
  }
  if (lowerMessage.includes("direction") || lowerMessage.includes("route") || lowerMessage.includes("how to get")) {
    return mockResponses.directions || DEFAULT_MOCK_RESPONSES.directions;
  }
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return mockResponses.hello || DEFAULT_MOCK_RESPONSES.hello;
  }

  return mockResponses.default || DEFAULT_MOCK_RESPONSES.default;
};

/**
 * Create OpenAI client
 */
export const createOpenAIClient = (apiKey: string): OpenAI => {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

/**
 * Build system prompt including plugin's system prompt
 */
export const buildSystemPrompt = (basePrompt?: string, pluginPrompt?: string): string => {
  const base = basePrompt || "You are a helpful assistant that can control a map.";
  const plugin = pluginPrompt || "";
  return `${base}\n\n${plugin}`.trim();
};

/**
 * Convert ChatMessage array to OpenAI API format
 */
export const convertToApiMessages = (
  messages: ChatMessage[],
  systemPrompt: string
): OpenAI.Chat.ChatCompletionMessageParam[] => {
  return [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => {
      if (m.role === "tool") {
        return {
          role: "tool" as const,
          content: m.content,
          tool_call_id: m.toolCallId!,
        };
      }
      if (m.role === "assistant" && m.toolCalls) {
        return {
          role: "assistant" as const,
          content: m.content || null,
          tool_calls: m.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: {
              name: tc.name,
              arguments: tc.arguments,
            },
          })),
        };
      }
      return {
        role: m.role as "user" | "assistant",
        content: m.content,
      };
    }),
  ];
};

/**
 * Build tools array for OpenAI API
 */
export const buildToolsParam = (
  toolDefinition: ToolDefinition
): OpenAI.Chat.ChatCompletionTool[] => {
  return [
    {
      type: "function",
      function: {
        name: toolDefinition.name,
        description: toolDefinition.description,
        parameters: toolDefinition.parameters,
      },
    },
  ];
};

/**
 * Execute plugin and return result
 */
export const executePluginWithContext = async (
  execute: (context: ToolContext, args: unknown) => Promise<ToolResult>,
  args: unknown,
  currentResult: ToolResult | null
): Promise<ToolResult> => {
  const context: ToolContext = {
    currentResult,
  };
  return await execute(context, args);
};

/**
 * Call OpenAI Chat API
 */
export const callOpenAI = async (
  client: OpenAI,
  model: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  tools: OpenAI.Chat.ChatCompletionTool[]
): Promise<OpenAI.Chat.ChatCompletion> => {
  return await client.chat.completions.create({
    model,
    messages,
    tools,
    tool_choice: "auto",
  });
};
