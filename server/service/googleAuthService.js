import GoogleAuth from "../models/googleAuth.js";

export const createOrUpdateGoogleAuthService=async (userId,code,accessToken,refreshToken)=>{
    const filter = { userId: userId };
    const update = { $set: {userId:userId,code : code,accessToken : accessToken,refreshToken:refreshToken} };
    const options = { upsert: true };
    return await GoogleAuth.updateOne(filter, update, options);
};

export const getGoogleAuthCredentialService = async(userId)=>{
    return await GoogleAuth.find({userId : userId});
};
export const setClientCredentials =(client,key,value)=>{
    if(key === "access_token"){
        client.setCredentials({access_token:value});
    }else if(key === "refresh_token"){
        client.setCredentials({refresh_token:value});
    }

};
export const setAccessToken = async (client,refreshToken)=>{
    client.setCredentials({ refresh_token: refreshToken });
    const newTokenResponse = await client.refreshAccessToken();
    const newTokens = newTokenResponse.credentials;
    client.setCredentials({ access_token: newTokens.access_token});
};
export const deleteGoogleAuthCredentialService = async(userId)=>{
    return await GoogleAuth.deleteOne({userId : userId});
};