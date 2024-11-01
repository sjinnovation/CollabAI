import { Pinecone } from '@pinecone-database/pinecone'
import { getOpenAIInstance } from '../config/openAI.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index( process.env.PINECONE_INDEX_NAME);

export const createEmbeddingWithLLM =async (model,payload)=>{
    const openai = await getOpenAIInstance();
    return await openai.embeddings.create({
        model: model, //"text-embedding-ada-002"
        input: payload,
      });

}
export const upsertVectorDB=async (namespace,upsertPayload)=>{
    return await index.namespace(namespace).upsert(upsertPayload);

};

export const deleteAllEmbeddingFromNameSpace = async (namespace) => {
    const results = await index.namespace(namespace).listPaginated();
    const ns = await index.namespace(namespace)

    for (const vector of results.vectors) {
        try {
            await ns.deleteOne(vector.id);
        } catch (error) {
            console.error(`Error deleting vector with id ${vector.id}:`, error);
        }
    }
    return true;
};


export const chatResponse = async ()=>{
    const openai = await getOpenAIInstance();
    const gptModel = await getOpenAiConfig('model');
    return await openai.chat.completions.create({
        model: gptModel,
        messages: messages,
      });
}
export const vectorQuery =async (namespace,queryRequest)=>{
    return await index.namespace(namespace).query(queryRequest);
};