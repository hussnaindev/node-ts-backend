import { Bucket as GCPBucket, Storage } from '@google-cloud/storage';
import { generateFileName } from '../../../utils/files';

export class Bucket {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        this.storage = new Storage();
        this.bucketName = process.env.BUCKET_NAME || '';
    }

    private getBucket(): GCPBucket {
        return this.storage.bucket(this.bucketName);
    }

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

    async uploadImages(files: Express.Multer.File[], basePath: string): Promise<string[]> {
        const uploadPromises = files.map(async (file) => {
            const uniqueFileName = generateFileName(file);
            const destinationPath = `${process.env.ENV}/${basePath}/${uniqueFileName}`;
            return await this.uploadImage(file.buffer, destinationPath);
        });

        return Promise.all(uploadPromises);
    }

    getImageUrl(bucketFilePath: string): string {
        return `https://storage.googleapis.com/${this.bucketName}/${bucketFilePath}`;
    }
}
