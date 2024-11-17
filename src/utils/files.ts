import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

/**
 * Save a buffer from a Multer file into a file in the 'uploads' directory.
 * @param file - The file object from Multer (which contains `buffer`, `originalname`, etc.)
 * @param filename - The name of the file to be created (you can also use `file.originalname` or another approach)
 */
export function saveBufferToFile(file: Express.Multer.File): string {
    const uploadDir = path.join(__dirname, '../uploads'); // Ensure the 'uploads' folder exists

    // Create 'uploads' directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName); // Use original name, or create a unique name like `${Date.now()}-${file.originalname}`

    // Write the buffer to the file
    fs.writeFileSync(filePath, file.buffer);

    return fileName; // Return the full path where the file was saved
}


export function generateFileName(file: Express.Multer.File) {
    const originalName = file.originalname; // Get the original file name
    const extension = originalName.substring(originalName.lastIndexOf('.')); // Extract file extension
    return `${uuid()}${extension}`; // Create a unique filename with UUID and extension
}
