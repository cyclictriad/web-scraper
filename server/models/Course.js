import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate course names
    index: true // Adds an index for efficient lookups
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

export default mongoose.model('Course', courseSchema);
