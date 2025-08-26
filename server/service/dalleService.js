export const getValidDescription = (dalleImageDescription)=>{
    if (typeof dalleImageDescription === 'string') {
        return dalleImageDescription.trim(); 
    }
    
    if (Array.isArray(dalleImageDescription)) {

        const filteredArray = [...new Set(dalleImageDescription.map(item => item.trim()).filter(item => item !== ''))];
        return filteredArray.length > 0 ? filteredArray[0] : ''; // Return first valid value
    }
    
    return '';
}

