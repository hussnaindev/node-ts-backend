import { DeleteObjectCommand, GetObjectCommand, ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { LOG_GROUPS, LOG_STREAMS } from '../../../constants/constants';
import { tryCatch } from '../../../utils/decorators/tryCatch';
import Logger from '../../../utils/Logger';


class S3 {
    private s3Client: S3Client;
    private bucketName: string;
    private logger: Logger;

    constructor(bucketName?: string, reqId?: string) {
        this.s3Client = new S3Client();
        this.bucketName = bucketName || process.env.AWS_S3_BUCKET_NAME || '';
        this.logger = new Logger(LOG_GROUPS.NODE_SERVER_LOGS, LOG_STREAMS.REQUEST_LOGS, reqId);
    }

    @tryCatch('Failed to upload object to S3')
    public async uploadObject(key: string, body: Buffer | string, contentType?: string): Promise<void> {
        this.logger.info('Uploading object to S3...');
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        });
        await this.s3Client.send(command);
        this.logger.info('Object uploaded to S3 successfully!');
    }

    @tryCatch('Failed to retrieve object from S3')
    public async getObject(key: string): Promise<Buffer | undefined> {
        this.logger.info('Fetching object from S3...');
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
            const res = Buffer.concat(chunks);
            this.logger.info(`${res.length} Objects fetched from S3 successfully!`);
            return res
        }

        this.logger.info('No object found from S3!');
        return undefined;
    }

    @tryCatch('Failed to delete object from S3')
    public async deleteObject(key: string): Promise<void> {
        this.logger.info('Deleting object from S3...');
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        await this.s3Client.send(command);
        this.logger.info('Object deleted from S3 successfully!');
    }

    @tryCatch('Failed to list objects in S3 bucket')
    public async listObjects(prefix?: string): Promise<string[]> {
        this.logger.info('Fetching objects from S3...');
        const command = new ListObjectsCommand({
            Bucket: this.bucketName,
            Prefix: prefix,
        });

        const response = await this.s3Client.send(command);
        this.logger.info('Objects fetched from S3 successfully!');
        return response.Contents?.map((item) => item.Key || '') || [];
    }

    @tryCatch('Failed to get image URLs')
    public async getImageUrls(prefix?: string): Promise<{ key: string; url: string }[]> {
        this.logger.info('Fetching images urls from S3...');
        const keys = await this.listObjects(prefix);

        const signedUrlPromises = keys.map(async (key) => {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour expiration
            return { key, url };
        });

        const imagesUrls = await Promise.all(signedUrlPromises);
        this.logger.info('Images urls fetched from S3 successfully!');
        return imagesUrls;
    }
}

export default S3;