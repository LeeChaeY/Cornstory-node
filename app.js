const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const socketIO = require("socket.io");
const moment = require("moment");
const mongoose = require('mongoose');

const cors = require('cors');

// Express의 미들웨어 불러오기
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const static = require('serve-static');
const errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
const expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
const expressSession = require('express-session');


//===== Passport 사용 =====//
const passport = require('passport');
const flash = require('connect-flash');


// 모듈로 분리한 설정 파일 불러오기
// const config = require('./config/config');

// // 모듈로 분리한 데이터베이스 파일 불러오기
// const database = require('./src/database/database.js');
// let db = database();
// // console.log(db.collection);
// const collection = db.collection('auto_sequence');
// console.log(collection);


// // 모듈로 분리한 라우팅 파일 불러오기
// const route_loader = require('./routes/route_loader');

app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));

app.use(cors()); // 모든 도메인에서의 요청을 허용합니다.

const PORT = process.env.PORT || 3000;
app.set('port', PORT);

app.use(bodyParser.urlencoded({ extended: true }));


// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, "src"))); // console.log(__dirname) // C:\Users\choi4\chat 가리킴
// public 폴더를 static으로 오픈
// app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
  secret:'my key',
  resave:true,
  saveUninitialized:true
}));


//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


//라우팅 정보를 읽어들여 라우팅 설정
// const router = express.Router();
// route_loader.init(app, router);


// 패스포트 설정
// const configPassport = require('./config/passport');
// configPassport(app, passport);

// // 패스포트 라우팅 설정
// const userPassport = require('./routes/user_passport');
// userPassport(router, passport);



//===== 404 에러 페이지 처리 =====//
// const errorHandler = expressErrorHandler({
//  static: {
//    '404': './public/404.html'
//  }
// });

// app.use( expressErrorHandler.httpError(404) );
// app.use( errorHandler );

//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
  console.log('uncaughtException 발생함 : ' + err);
  console.log('서버 프로세스 종료하지 않고 유지함.');

  console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

// app.on('close', function () {
//   console.log("Express 서버 객체가 종료됩니다.");
//   if (database.db) {
//     database.db.close();
//   }
// });




const server = http.createServer(app);
server.listen(PORT, ()=>console.log(`server is running ${PORT}`));
const io = socketIO(server);


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
const getAllChats = async () => {
  try {
    return await Chat.find({});
  } catch (error) {
    console.error('Error retrieving chats:', error.message);
    throw error;
  }
};


const deleteChatsByChatSpaceNo = async (chatSpaceNo) => {
  try {
    return await Chat.deleteMany({chatSpaceNo:chatSpaceNo});
  } catch (error) {
    console.error('Error retrieving chats:', error.message);
    throw error;
  }
};

let data;
app.post('/receive-post', async (req, res) => {
  try {
    await connectDB();
    const chats = await getAllChats();
    
    data = {
      chatSpace: JSON.parse(req.body.chatSpace),
      list: chats,
      userList: JSON.parse(req.body.userList),
      totalCount: JSON.parse(req.body.totalCount),
      user: JSON.parse(req.body.user),
    };

    // Log the user data
    console.log(data.user);

    // Render the view with the data
    res.render('index', { data });
  } catch (error) {
    // Handle errors appropriately
    console.error('Error rendering page:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

  // 응답 메시지 전송 메소드
  function sendResponse(socket, command, code, message) {
    var statusObj = {command: command, code: code, message: message};
    socket.emit('response', statusObj);
  }

  io.sockets.on("connection", (socket)=>{
    console.log('connection info : ',socket.request.connection._peername);

    // 소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
    
    socket.join(data.chatSpace.chatSpaceNo);
    console.log(io.sockets.adapter.rooms);


    socket.on("message", async (data) => {
      const autoSequenceSchema = new mongoose.Schema({
        seq: Number,
      });
    
      const AutoSequence = mongoose.model('auto_sequence', autoSequenceSchema);
      let chatNo;
    
      try {
        // Execute the query and wait for the result
        const result = await AutoSequence.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true });
    
        // Check if the result exists before accessing its properties
        if (result) {
          chatNo = result.seq;
          console.log("chatNo: " + chatNo);
        } else {
          console.log("AutoSequence document not found.");
        }
      } catch (error) {
        console.error('Error getting next sequence:', error.message);
      }
    
      // Rest of your code
      console.dir(data);
      const { userId, chatContent, nickname, userImage, chatSpaceNo } = data;
      let message = {
        chatNo: parseInt(chatNo),
        userId: userId,
        chatContent: chatContent,
        chatDate: moment(new Date()).format("yyyy-MM-DD HH:mm"),
        nickname: nickname,
        userImage: userImage,
        chatSpaceNo: parseInt(chatSpaceNo)
      };
      console.log("message: " + message);
    
      let newChat = new Chat(message);
      console.log("newChat: " + newChat);
    
      const insertChats = async () => {
        try {
          await newChat.save();
        } catch (error) {
          console.error('Error saving chat:', error.message);
        }
      };
    
      // Use await to ensure the newChat is saved before moving forward
      await insertChats();
    
      // Rest of your code
      try {
        io.sockets.in(parseInt(chatSpaceNo)).emit('message', message);
      } catch (error) {
        console.error('Error emitting message:', error.message);
      }
    
      // 응답 메시지 전송
      sendResponse(socket, 'message', '200', '방 [' + chatSpaceNo + ']의 모든 사용자들에게 메시지를 전송했습니다.');
    });

  // socket.on('disconnect', function() {
  //   console.log('웹소켓 연결이 종료되었습니다.');
  // });
});





// app.get('/delete_chats', async (req, res) => {
//   req.get()
// });