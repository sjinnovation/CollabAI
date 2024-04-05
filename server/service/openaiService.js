
import OpenAI from 'openai'; 

export const getOpenAIPrompt = async (contextArray, temp, model, temperature, apiKey) => {
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    messages: [...contextArray, { role: "user", content: temp }],
    model,
    temperature,
  });

  return completion.choices[0].message.content;
};

// export default { getOpenAIPrompt };
