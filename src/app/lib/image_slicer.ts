'use client'

export function sliceImage(imageSrc: string, rows: number, cols: number) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = 'Anonymous';

        image.onload = () => {
            // Create the source canvas dynamically in memory
            const sourceCanvas = document.createElement('canvas');
            const sourceCtx = sourceCanvas.getContext('2d');
            if (!sourceCtx) return;

            sourceCanvas.width = image.width;
            sourceCanvas.height = image.height;

            // Draw the image onto the source canvas
            sourceCtx.drawImage(image, 0, 0);

            const subWidth = image.width / cols;
            const subHeight = image.height / rows;

            const subimages: string[] = [];

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    // Create a sub-canvas for each subimage
                    const subCanvas = document.createElement('canvas');
                    const subCtx = subCanvas.getContext('2d');
                    if (!subCtx) return;

                    subCanvas.width = subWidth;
                    subCanvas.height = subHeight;

                    // Draw a portion of the source canvas onto the sub-canvas
                    subCtx.drawImage(
                        sourceCanvas,
                        col * subWidth,
                        row * subHeight,
                        subWidth,
                        subHeight,
                        0,
                        0,
                        subWidth,
                        subHeight
                    );

                    // Store the sub-canvas in the array
                    subimages.push(subCanvas.toDataURL());
                }
            }

            // Resolve with the array of subimages
            resolve(subimages);
        };

        image.onerror = (err) => {
            reject(err);
        };
    });
}
