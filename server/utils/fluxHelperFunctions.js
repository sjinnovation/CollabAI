export const getFormattedThreadMessages = async (threadId)=>{
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data
        .map(data => ({
            role: data.role,
            content: data.content[0].text.value
        }))
        .reverse();
}

export const createImageGenerationPrompt = (question) => {
    const prompt = question + ' , remember : that if you are told to work on any previous answers,then ignore which answer does not contains ###Generated Image### .Do not generate any image if you are told to write something which is not related to image generation '
    return prompt;
}

export const getAICompletion = async (messages) => {
    return await openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: TOOLS,
    });
}

export const hasToolCalls =  (response) =>{
    return response?.choices[0]?.message?.tool_calls?.[0]?.function;
}

export const processImageToolCall = async (response, userId, threadId, question)=>{
    const functionCall = response.choices[0].message.tool_calls[0].function;
    const { description } = JSON.parse(functionCall.arguments);
    
    // Generate image and get S3 link
    const s3Link = await createFluxImage(description, userId, threadId);
    
    // Create modified prompt with image
    const modifiedPrompt = createModifiedPrompt(question, s3Link);
    
    // Create thread message
    return await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: modifiedPrompt
    });
}
export const createModifiedPrompt = (question, s3Link,description)=> {
    // return `read the question only  but do not answer anything else and there could be a Image url,do not read it but add it with your answer and just say '###Generated Image###' and then add the link from the question.Do not add any other thing in your answer not even a word.\n\nQuestion : ${question} \n\n###Image : ${s3Link}###\n\nDescription : ${description}`
    // return `IMPORTANT: Read only the question only. Do not analyze, interpret, or respond to the description or any other part of the input. Your response **must** follow this exact structure and nothing else: \n\n###Generated Image### ${s3Link}\n\nEnsure there are no additional words, symbols, or formatting in the response and Do not change the response structure i have given you.\n\nQuestion : ${question} \n\n###Image : ${s3Link}###\n\nDescription : ${description}`
    return `Question: ${question} Description: ${description}. IMPORTANT: Read only the question and ignore everything else. Respond with exactly: "###Generated Image### ${s3Link}" and nothing more—no extra words, symbols, or formatting.`
}

