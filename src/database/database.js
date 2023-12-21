const mongoose = require('mongoose');

// Define the Chat schema
const chatSchema = new mongoose.Schema({
  chatNo: { type: Number, required: true },
  userId: { type: String, required: true },
  chatContent: { type: String, required: true },
  chatDate: { type: String, required: true },
  nickname: { type: String, required: true },
  userImage: { type: String, required: true },
  chatSpaceNo: { type: Number, required: true },
  chatImage: { type: String },
});

// Create the Chat model
const Chat = mongoose.model('chat', chatSchema);

const autoSequenceSchema = new mongoose.Schema({
  seq: Number,
});

const AutoSequence = mongoose.model('auto_sequence', autoSequenceSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const dbURI = "mongodb://corn:corncorn*3@kbsco.pub-vpc.mg.naverncp.com:17017/corn?directConnection=true";
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB 연결 성공');
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Retrieve all chats from the Chat collection
const listChatsByChatSpaceNo = async (chatSpaceNo) => {
  try {
    return await Chat.find({chatSpaceNo:chatSpaceNo});
  } catch (error) {
    console.error('Error retrieving chats:', error.message);
    throw error;
  }
};

const listChatsBySearchKeyword = async (chatSpaceNo, searchKeyword) => {
  const regexSearch = new RegExp(searchKeyword, 'i');
  try {
    return await Chat.find({
      chatSpaceNo: chatSpaceNo, 
      $or: [
      { nickname: regexSearch },
      { chatContent: regexSearch }
    ]});
  } catch (error) {
    console.error('Error retrieving chats:', error.message);
    throw error;
  }
};

const getAutoSequence = async () => {
  try {
    const result = await AutoSequence.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true });
    
    // Check if the result exists before accessing its properties
    if (result) {
      return result.seq;
    } else {
      console.log("AutoSequence document not found.");
    }
  } catch (error) {
    console.error('Error getting next sequence:', error.message);
  }
};


const insertChats = async (newChat) => {
  try {
    await newChat.save();
  } catch (error) {
    console.error('Error saving chat:', error.message);
  }
};


const deleteChatsByChatSpaceNo = async (chatSpaceNo) => {
  try {
    await Chat.deleteMany({chatSpaceNo:chatSpaceNo});
    console.log("deleteChats finish");
  } catch (error) {
    console.error('Error retrieving chats:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  listChatsByChatSpaceNo,
  listChatsBySearchKeyword,
  getAutoSequence, 
  insertChats,
  deleteChatsByChatSpaceNo,
  Chat, // Exporting the Chat model for advanced usage if needed
};
