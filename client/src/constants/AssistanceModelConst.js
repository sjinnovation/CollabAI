

// assistantConstants.js

export const getAssistantModels = (role) => {
  const assistantGptModels = [
    "gpt-4-1106-preview",
    // "gpt-4",
    // "gpt-4-0314",
    // "gpt-4-0613",
    // "gpt-3.5-turbo-16k",
    // "gpt-3.5-turbo-16k-0613",
    "gpt-3.5-turbo-1106",
    // "gpt-3.5-turbo",
    // "gpt-3.5-turbo-0613",
    // Add more models as needed,
    "gpt-4o",
    "o3-mini",
    "gpt-4o-mini",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "ft:gpt-4o-mini-2024-07-18:sj-innovation:sjinnovation-v1:AbQIZwsV"
  ];

  if (role === 'superadmin' || role === 'admin') {
    assistantGptModels.push("gpt-4.1");
  }

  return assistantGptModels;
}


export const modelDescriptions = {
  "gpt-4-1106-preview": "GPT-4 preview (1106) with enhanced reasoning and accuracy for complex tasks.",
  "gpt-3.5-turbo-1106": "Fast, cost-efficient GPT-3.5 model optimized for real-time interactions.",
  "gpt-4o": "General-purpose GPT-4 Omni, great for deep understanding and problem-solving.",
  "o3-mini": "Lightweight O3 model, quick reasoning with reduced complexity.",
  "gpt-4o-mini": "Compact GPT-4 Omni Mini, optimized for smaller devices and faster responses.",
  "gpt-4.1": "Updated GPT-4.1 with improved precision, speed, and nuanced understanding.",
  "gpt-4.1-mini": "Mini version of GPT-4.1, optimized for faster responses on smaller devices.",
  "gpt-4.1-nano": "Ultra-fast GPT-4.1 Nano for low-latency applications.",
  "ft:gpt-4o-mini-2024-07-18:sj-innovation:sjinnovation-v1:AbQIZwsV": "Fine-tuned GPT-4 Omni for SJ Innovation, optimized for specific tasks."
};




// Create a mapping to display user-friendly names
export const modelNameMapping = {
  "gpt-4-1106-preview": "GPT-4 1106 Preview",
  "gpt-3.5-turbo-1106": "GPT-3.5 Turbo 1106",
  "gpt-4o": "GPT-4 Omni",
  "o3-mini": "O3 Mini",
  "gpt-4o-mini": "GPT-4 Omni Mini",
  "gpt-4.1": "GPT-4.1",
  "gpt-4.1-mini": "GPT-4.1 Mini",
  "gpt-4.1-nano": "GPT-4.1 Nano",
  "ft:gpt-4o-mini-2024-07-18:sj-innovation:sjinnovation-v1:AbQIZwsV": "Fine-tuned GPT-4 Omni (SJ Innovation)"
};