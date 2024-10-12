import fs from 'fs';
import path from 'path';

/**
 * Save a buffer from a Multer file into a file in the 'uploads' directory.
 * @param file - The file object from Multer (which contains `buffer`, `originalname`, etc.)
 * @param filename - The name of the file to be created (you can also use `file.originalname` or another approach)
 */
export function saveBufferToFile(file: Express.Multer.File): string {
    const uploadDir = path.join(__dirname, '../uploads'); 


    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return fileName;
}
