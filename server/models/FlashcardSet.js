import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['PDF', 'META', 'UPLOADED'],  // Various stages of the quiz lifecycle
    },
    at: {
        type: Date,
        default: Date.now
    }
}, { _id: false })

const FlashcardSetSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    name: String,  // Name of the quiz
    title: String,
    book: String,  // Book or topic the quiz is based on
    questions: Number,
    pages: Number,
    creationDate:Date,
    statusHistory: [statusSchema],
    price: {
        type: Number,
        min: [2.5, 'Price must be at least 2.5'],  // Price for the quiz
    },
    keywords: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length <= 8;
            },
            message: 'You can only have up to 8 keywords'
        }
    },
    description: {
        type: String,
    },
    urls: {
        local: String,
        remote: {
            root: {
                type: String,
                required: true,
            },
            self: {
                type: String,
                unique:true
            },
            parent:{
                type: String,
            }
        }
    }
}, { timestamps: true });

// Indexing to improve query performance
FlashcardSetSchema.index({ id: 1, status: 1 });


export default mongoose.model('FlashcardSet', FlashcardSetSchema, 'Flashcard Sets')
