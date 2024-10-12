import multer from 'multer';
import path from 'path';


export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '../uploads');
            cb(null, uploadDir); 
        },
        filename: (req, file, cb) => {
            
            const ext = path.extname(file.originalname); 
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
            cb(null, filename); 
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, 
});
