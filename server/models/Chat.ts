// server/models/chat.js
import mongoose from 'mongoose'

// Schema for individual messages within a conversation
const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'],
    required: true 
  },
  model:{
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
})

// Schema for a conversation/chat session
const chatSchema = new mongoose.Schema({
  id:{
    type:String,
    index:true,
    required:true,
    unique:true,
  },
  userId: { 
    type: mongoose.Types.ObjectId, 
    required: true,
    ref:'User',
    index: true // Index for faster user-based queries
  },
  title: { 
    type: String,
    default: function() {
      // Default title could be date or first few words of first message
      return `Chat ${new Date().toLocaleDateString()}`
    }
  },
  messages: [messageSchema],
  model: { 
    type: String,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    creativity: {
      type: String,
      enum: ['low', 'high'],
      default: 'low'
    },
    longResponses: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
})

// Indexes
chatSchema.index({ userId: 1, createdAt: -1 }) // For querying user's chats by date
chatSchema.index({ userId: 1, status: 1 }) // For querying active/archived chats

// Methods
chatSchema.methods.addMessage = function(role: string, content: string, model:string) {
  this.messages.push({ role, content, model })
  this.updatedAt = new Date()
  return this.save()
}

chatSchema.methods.updateTitle = function(newTitle: string) {
  this.title = newTitle
  return this.save()
}

// Static methods for common queries
chatSchema.statics.findUserChats = function(userId: string) {
  return this.find({ 
    userId, 
    status: 'active' 
  }).sort({ updatedAt: -1 })
}

chatSchema.statics.findChat = function(userId: string, chatId: string) {
  return this.findOne({ 
    _id: chatId, 
    userId, 
    status: { $ne: 'deleted' } 
  })
}

// Virtual for message count
chatSchema.virtual('messageCount').get(function() {
  return this.messages.length
})

export default mongoose.model('Chat', chatSchema)