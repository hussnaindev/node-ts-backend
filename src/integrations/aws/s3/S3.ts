import { DeleteObjectCommand, GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { tryCatch } from '../../../utils/decorators/tryCatch';


class S3 {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(bucketName?: string) {
        this.s3Client = new S3Client();
        this.bucketName = bucketName || process.env.AWS_S3_BUCKET_NAME || '';
    }

    @tryCatch('Failed to upload object to S3')
    public async uploadObject(key: string, body: Buffer | string, contentType?: string): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        });
        await this.s3Client.send(command);
    }

    @tryCatch('Failed to retrieve object from S3')
    public async getObject(key: string): Promise<Buffer | undefined> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        const response = await this.s3Client.send(command);

        if (response.Body) {
            const chunks: Uint8Array[] = [];
            for await (const chunk of response.Body as any) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }

        return undefined;
    }

    @tryCatch('Failed to delete object from S3')
    public async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
    }

    @tryCatch('Failed to list objects in S3 bucket')
    public async listObjects(prefix?: string): Promise<string[]> {
        const command = new ListObjectsCommand({
            Bucket: this.bucketName,
            Prefix: prefix,
        });

        const response = await this.s3Client.send(command);
        return response.Contents?.map((item) => item.Key || '') || [];
    }

    @tryCatch('Failed to get image URLs')
    public async getImageUrls(prefix?: string): Promise<{ key: string; url: string }[]> {
        const keys = await this.listObjects(prefix);

        const signedUrlPromises = keys.map(async (key) => {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour expiration
            return { key, url };
        });

        return Promise.all(signedUrlPromises);
    }
}

export default S3;