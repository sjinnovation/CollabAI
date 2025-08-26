export const DallEResolutions = {
  "dall-e-3": ["1024x1024", "1024x1792", "1792x1024"],
  "dall-e-2": ["512x512", "256x256"],
};

export const ClaudeModels = [
  { value: "claude-3-opus-20240229", label: "claude-3-opus-20240229", limit: 4096 },
  { value: "claude-3-sonnet-20240229", label: "claude-3-sonnet-20240229", limit: 4096 },
  { value: "claude-3-haiku-20240307", label: "claude-3-haiku-20240307", limit: 4096 },
  { value: "claude-3-5-sonnet-20240620", label: "claude-3-5-sonnet-20240620", limit: 8192 },
  { value: "claude-3-7-sonnet-20250219", label: "claude-3-7-sonnet-20250219", limit: 64000 },
  { value: "claude-sonnet-4-20250514", label: "claude-sonnet-4-20250514", limit: 64000 },
  { value: "claude-opus-4-20250514", label: "claude-opus-4-20250514", limit: 32000 }
];
