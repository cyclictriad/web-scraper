import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate subject names
    index: true // Adds an index for efficient lookups
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Links subject to the related course
    required: true
  },
  host:{
    type:String
  },
  href:{
    type:String
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

export default mongoose.model('Subject', subjectSchema);
