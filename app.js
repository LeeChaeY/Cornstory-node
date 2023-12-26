const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const moment = require("moment");

const cors = require("cors");

// Express의 미들웨어 불러오기
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const static = require('serve-static');
const errorHandler = require("errorhandler");

// 에러 핸들러 모듈 사용
const expressErrorHandler = require("express-error-handler");

// Session 미들웨어 불러오기
const expressSession = require("express-session");

//===== Passport 사용 =====//
const passport = require("passport");
const flash = require("connect-flash");

// 모듈로 분리한 설정 파일 불러오기
// const config = require('./config/config');

// // 모듈로 분리한 라우팅 파일 불러오기
// const route_loader = require('./routes/route_loader');

app.set("view engine", "ejs");
// Set the views directory
app.set("views", path.join(__dirname, "views"));

app.use(cors()); // 모든 도메인에서의 요청을 허용합니다.

const PORT = process.env.PORT || 3000;
app.set("port", PORT);

app.use(bodyParser.urlencoded({ extended: true }));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "src"))); // console.log(__dirname) // C:\Users\choi4\chat 가리킴

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(
  expressSession({
    secret: "my key",
    resave: true,
    saveUninitialized: true,
  })
);

//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://101.79.8.55:3000');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

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

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on("uncaughtException", function (err) {
  console.log("uncaughtException 발생함 : " + err);
  console.log("서버 프로세스 종료하지 않고 유지함.");

  console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on("SIGTERM", function () {
  console.log("프로세스가 종료됩니다.");
  app.close();
});





//===== 서버 시작 =====//

const {
  connectDB,
  listChatsByChatSpaceNo,
  listChatsBySearchKeyword,
  getAutoSequence,
  insertChats,
  deleteChatsByChatSpaceNo,
  Chat,
} = require("./src/database/database"); // 경로에 맞게 수정

// 응답 메시지 전송 메소드
function sendResponse(socket, command, code, message) {
  const statusObj = { command: command, code: code, message: message };
  socket.emit("response", statusObj);
}

const socketIO = require("socket.io");
const server = http.createServer(app);
server.listen(PORT, () => console.log(`server is running ${PORT}`));

// In your Node.js server
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:8088"], // Add your allowed origins
    methods: ["GET", "POST"],
  },
});

let chatSpaceNo2;
app.post('/', async (req, res) => {
  try {
    await connectDB();
    chatSpaceNo2 = JSON.parse(req.body.chatSpace).chatSpaceNo;
    console.log("dddd"+JSON.parse(req.body.startDate));
    const chats = await listChatsByChatSpaceNo(
      chatSpaceNo2, 
      JSON.parse(req.body.startDate)
      );
    
    const data = {
      chatSpace: JSON.parse(req.body.chatSpace),
      list: chats,
      userList: JSON.parse(req.body.userList),
      totalCount: JSON.parse(req.body.totalCount),
      user: JSON.parse(req.body.user),
      searchKeyword: "", 
      startDate: JSON.parse(req.body.startDate)
    };

    // Log the user data
    console.log(data.user);
    console.log(data.startDate);

    // Render the view with the data
    res.render('index', { data });
    
  } catch (error) {
    // Handle errors appropriately
    console.error('Error rendering page:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


io.sockets.on("connection", (socket) => {
  console.log("한명의 유저가 접속을 했습니다.");

  if (chatSpaceNo2 != null) {
    socket.join(chatSpaceNo2, (err) => {
      if (err) {
        console.error(`Error joining room ${chatSpaceNo2}: ${err.message}`);
      } else {
        console.log(`Socket ${socket.id} joined room ${chatSpaceNo2}`);

      }
    });
    console.log(io.sockets.adapter.rooms);
  }
  // console.log("connection info : ", socket.request.connection._peername);

  // 소켓 객체에 클라이언트 Host, Port 정보 속성으로 추가
  // socket.remoteAddress = socket.request.connection._peername.address;
  // socket.remotePort = socket.request.connection._peername.port;
  // let chatSpaceNo2;

  socket.on("connection", async (data) => {
    socket.join(data.userId);
    console.log(io.sockets.adapter.rooms);

    // socket.emit("enter", );
  });

  socket.on("message", async (data) => {
    try {
      const chatNo = await getAutoSequence();
      console.log("chatNo: " + chatNo);

      const { userId, chatContent, nickname, userImage, chatSpaceNo } = data;

      const message = {
        chatNo: parseInt(chatNo),
        userId: userId,
        chatContent: chatContent,
        chatDate: moment(new Date()).format("YYYY-MM-DD HH:mm"), // Fix the date format
        nickname: nickname,
        userImage: userImage,
        chatSpaceNo: parseInt(chatSpaceNo),
      };

      console.log("message: ", message);

      const newChat = new Chat(message);

      console.log("newChat: ", newChat);

      // Use await to ensure the newChat is saved before moving forward
      await insertChats(newChat); // Pass the newChat object to insertChats function

      io.sockets.in(parseInt(chatSpaceNo)).emit("message", message);
      // io.sockets.in(parseInt(chatSpaceNo)).emit("message", message);

      // 응답 메시지 전송
      sendResponse(
        socket,
        "message",
        "200",
        "방 [" + chatSpaceNo + "]의 모든 사용자들에게 메시지를 전송했습니다."
      );
    } catch (error) {
      console.error("Error processing message:", error.message);
      // Handle the error or log it appropriately
    }
  });

  socket.on("search", async (data) => {
    try {
      console.log("data : " + data.chatSpaceNo + ", " + data.searchKeyword+", "+data.startDate);
      const chats = await listChatsBySearchKeyword(
        parseInt(data.chatSpaceNo),
        data.searchKeyword + "", 
        data.startDate
      );
      // console.log("chats : "+chats);
      socket.emit("search", chats);
    } catch (error) {
      console.error("Error processing message:", error.message);
      // Handle the error or log it appropriately
    }
  });

  socket.on("listChatSpace", (data) => {
    console.log("웹소켓 연결이 종료되었습니다.");
  });

  socket.on("disconnect", (data) => {
    console.log("웹소켓 연결이 종료되었습니다.");
  });

  socket.on("delete", async (data) => {
    try {

      // Ensure chatSpaceNo is a valid number
      if (isNaN(data.chatSpaceNo)) {
        return res.status(400).json({ error: "Invalid chatSpaceNo" });
      }

      // Use await to wait for the delete operation to complete
      await deleteChatsByChatSpaceNo(parseInt(data.chatSpaceNo));

      // Send a success response
      res.status(200).json({ message: "Chats deleted successfully" });

      // 특정 소켓 ID를 가지는 소켓 찾기
      const targetSocket = io.sockets.sockets[data.chatSpaceNo];

      if (targetSocket) {
        // 해당 소켓 삭제
        targetSocket.destroy();
      } else {
        console.log('Socket not found.');
      }

    } catch (error) {
      console.error("Error deleting chats:", error.message);

      // Send an error response
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // socket.on("close", async (data) => {
  //   console.log("Express 서버 객체가 종료됩니다.");
  //   if (database.db) {
  //     database.db.close();
  //   }
  // });

  socket.on("close", async (data) => {
    console.log(`Disconnecting user, ID: ${data.socketId}`);
    
    // 특정 소켓 ID를 가지는 소켓 찾기
    const targetSocket = io.sockets.sockets[data.socketId];

    if (targetSocket) {
      // 해당 소켓 삭제
      targetSocket.disconnect(true);
    } else {
      console.log('Socket not found.');
    }
  });



});
