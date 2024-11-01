import VectorStores from "../models/vectorStoreModel.js"

export const insertVectorStoreInfoToDB = async (id, name, userId) => {
    try {
       const createdVectorStore = await VectorStores.create({
        storeId: id,
        storeName: name,
        userId: userId
    })
    return {success: true, createdVectorStore}
    } catch (error) {
    return {success: false, error} 
    }
}