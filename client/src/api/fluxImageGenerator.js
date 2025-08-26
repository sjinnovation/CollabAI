import { FLUX_IMAGE_DOWNLOAD_SLUG, FLUX_KEY_SLUG, FLUX_USER_BASED_KEY_SLUG, WEB_CRAWLER_KEY_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { getUserID } from "../Utility/service";
import { v4 as uuidv4 } from 'uuid';

const userId = getUserID();

export const getQuestionAndImageUrl = (text)=>{
    const imageUrlMatch = text.match(/###Image\s*:\s*(.+?)###/);
    const imageUrl = imageUrlMatch ? imageUrlMatch[1].trim() : null;
  
    const questionMatch = text.match(/Question\s*:\s*(.+)/);
    let query = questionMatch ? questionMatch[1].trim() : null;
    query = query

    return {query,imageUrl};
}

export const getImageLink = (text) => {
  const regex = /###\s*Generated Image\s*###/;
  let isImageLinkFound = regex.test(text);

  let imageUrl = isImageLinkFound 
      ? text.replace(regex, '').trim() 
      : null;

  if (imageUrl) {
      imageUrl = imageUrl.replace(/###Image\s*:/, '').trim();
  }

  return { imageUrl, isImageLinkFound };
};


export const storeFluxKeyToDB = async (fluxKey)=>{
    const body = {
        userId : userId,
        fluxKey : fluxKey
    }
    const responseOfFluxKeyStore = await axiosSecureInstance.post(FLUX_KEY_SLUG,body);
    return responseOfFluxKeyStore;
};

export const getFluxCredentials = async (setIsFluxConnected)=>{
    const fluxCredential = userId?await axiosSecureInstance.get(FLUX_USER_BASED_KEY_SLUG(userId)):null;
    if(fluxCredential?.data?.getFluxCredential?.accessToken){
        setIsFluxConnected(true);
    }else{
        setIsFluxConnected(false);
    }
    return fluxCredential
};

export const deleteFluxKeyFromDB = async ()=>{
    const responseOfFluxKeyDelete = await axiosSecureInstance.delete(FLUX_USER_BASED_KEY_SLUG(userId));
    return responseOfFluxKeyDelete;
};

export const checkIsValidUrl = (text)=>{
    try {
      new URL(text);
      return true;
    } catch (error) {
      return false;
    }
  }
export const handleDownloadS3Image1 = async (s3Url, fileName = 'downloaded-image') => {
    try {
        const response = await fetch(s3Url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `${fileName}.jpg`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Error downloading image:', error);
    }
};

export const handleDownloadS3Image2 = async (s3Url,event) => {
    const button = event?.currentTarget;
    try {
      // Add loading state
      button.classList.add('loading');
      button.disabled = true;
  
      const fileName = s3Url.split('?')[0].split('/').pop();
      
      const response = await fetch(s3Url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const imageBlob = await response.blob();
      const blobUrl = URL.createObjectURL(imageBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = decodeURIComponent(fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      // Remove loading state
      button.classList.remove('loading');
      button.disabled = false;
    }
  };

export const handleDownloadS3Image = async (imageUrl) => {
  try {
    const regex = /https:\/\/collaborativeai\.s3\.amazonaws\.com\/([^?]+\.jpg)/;
    const match = imageUrl.match(regex);
    let imageBody = ''
    let imageBlob = ''

    if (match) {
      imageBody = await axiosSecureInstance.get(FLUX_IMAGE_DOWNLOAD_SLUG(match[1]));
      const data = imageBody.data;

      // Extract the base64 string from the response
      const base64String = data.base64;

      // Convert the base64 string to a Blob
      const byteCharacters = atob(base64String.split(',')[1]); 
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let index = 0; index < slice.length; index++) {
          byteNumbers[index] = slice.charCodeAt(index);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      imageBlob = new Blob(byteArrays, { type: 'image/jpeg' });
    } else {
      console.log('No match found');
    }
    const uuid = uuidv4();
    const uuid1 = uuidv4();
    const url = URL.createObjectURL(imageBlob);

    // Create a hidden anchor element
    const a = document.createElement("a");
    a.href = url;
    a.download = uuid + uuid1 + "image.jpg"; 
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Release the object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the image:", error);
  }
}