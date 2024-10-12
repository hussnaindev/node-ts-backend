import mongoose from 'mongoose';

const mongoURI = process.env.MONGO_CONNECTION_STRING || '';

export const connectMongoDB = () => {
        mongoose.connect(mongoURI)
                .then(() => console.log('MongoDB connected!'))
                .catch((err) => console.log(err));
};
