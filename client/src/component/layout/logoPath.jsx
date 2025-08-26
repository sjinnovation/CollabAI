const logoPath = async (logoType) => {
    const logoPaths = [
        `/logo/${logoType}.png`,
        `/logo/${logoType}.jpg`,
        `/logo/${logoType}.svg`
    ];

    for (const path of logoPaths) {
        const imageExists = await new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                console.log(`Found valid image at: ${path}`);
                resolve(true);
            };

            img.onerror = () => {
                console.log(`Image not found or invalid at: ${path}`);
                resolve(false);
            };

            img.src = path;
        });

        if (imageExists) {
            return path; // Return the first valid path
        }
    }

    return null; // No logo found
};

export default logoPath;