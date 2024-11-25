import mongoose from 'mongoose';


export async function connectDB() {

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('Please define the MONGO_URI environment variable');
    }

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        throw error;
    }
}
