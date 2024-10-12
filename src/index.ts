import 'reflect-metadata'; // required for TypeScript decorators
import { app } from './app';
import { connectMongoDB } from './config/databases/mongodb';

connectMongoDB();

const port = process.env.PORT;

app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
});
