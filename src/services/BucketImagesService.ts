import { Bucket, Storage } from '@google-cloud/storage';
import { generateFileName } from '../utils/files';

export class BucketImagesService {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage();
        this.bucketName = process.env.BUCKET_NAME || '';
    }

    private getBucket(): Bucket {
        return this.storage.bucket(this.bucketName);
    }

    /**
     * Uploads an image buffer to Google Cloud Storage.
     * @param {Buffer} fileBuffer - The file buffer.
     * @param {string} destinationPath - The destination path in the bucket.
     * @returns {Promise<string>} - Public URL of the uploaded image.
     */
    async uploadImage(fileBuffer: Buffer, destinationPath: string): Promise<string> {
        try {
            const bucketFile = this.getBucket().file(destinationPath);

            await bucketFile.save(fileBuffer, {
                gzip: true,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });

            return this.getImageUrl(destinationPath);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload image');
        }
    }

    /**
     * Uploads an array of image buffers to Google Cloud Storage.
     * @param {Array<Express.Multer.File[]>} files - An array of files.
     * @param {string} basePath - The base path in the bucket for storing images.
     * @returns {Promise<string[]>} - An array of public URLs for the uploaded images.
     */
    async uploadImages(files: Express.Multer.File[], basePath: string): Promise<string[]> {
        const uploadPromises = files.map(async (file) => {
            const uniqueFileName = generateFileName(file);
            const destinationPath = `${process.env.ENV}/${basePath}/${uniqueFileName}`;
            return await this.uploadImage(file.buffer, destinationPath);
        });

        return Promise.all(uploadPromises);
    }

    /**
     * Gets the public URL of an image in Google Cloud Storage.
     * @param {string} bucketFilePath - The path of the file in the bucket.
     * @returns {string} - Public URL of the image.
     */
    getImageUrl(bucketFilePath: string): string {
        return `https://storage.googleapis.com/${this.bucketName}/${bucketFilePath}`;
    }
}
