const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const moment = require("moment");

const cors = require('cors');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// const { WebSocketServer } = require("ws");

app.use(cors()); // 모든 도메인에서의 요청을 허용합니다.
const io = socketIO(server, {'forceNew':true}); // 변수에 server 담기

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "src"))); // console.log(__dirname) // C:\Users\choi4\chat 가리킴


app.use(bodyParser.urlencoded({ extended: true }));

server.listen(PORT, ()=>console.log(`server is running ${PORT}`));

app.post('/receive-post', (req, res) => {
    const data = {chatSpace:JSON.parse(req.body.chatSpace), 
        list: JSON.parse(req.body.list), 
        userList: JSON.parse(req.body.userList), 
        totalCount: JSON.parse(req.body.totalCount),
        user: JSON.parse(req.body.user)};
    // console.log('Data received from web server:', data);

    console.log(data.user);
    res.render('index', { data });

    // res.sendFile(path.join(__dirname, 'src', 'index.html'), {data:data});
    
    // res.status(200).send('Data received successfully');
  });



io.on("connection", (socket)=>{
  // socket.join();

  socket.on("chatting", (data) => {
      const {userId, chatContent, nickname, userImage, chatSpaceNo} = data;
      // 서버에서 클라에게 되돌려주기, 즉 보내주는 내용이 되겠음.
      io.emit("chatting", {
          userId, 
          chatContent, 
          chatDate: moment(new Date()).format("yyyy-MM-DD HH:mm A"), 
          nickname, 
          userImage, 
          chatSpaceNo
      });

      // MongoClient.connect(
      //     url, function(error, db){
      //       if(error) {
      //           console.log(error);
      //       } else {
      //           console.log("DB 연결 성공!");
      //       }
      //   });
  });

  // socket.on('disconnect', function() {
  //   console.log('웹소켓 연결이 종료되었습니다.');
  // });
});

    // const { MongoClient } = require("mongodb");

    // const uri = "mongodb://corn:corncorn*3@kbsco.pub-vpc.mg.naverncp.com:17017/corn";
    // // const uri = "mongodb://localhost:27017/admin";
    
    // async function run() {
    //   const client = new MongoClient(uri, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //     serverSelectionTimeoutMS: 50000, // Timeout in milliseconds for server selection
    //   });
    
    //   try {
    //     await client.connect();
    //     console.log("Connected to MongoDB");
    
    //     const database = client.db('corn');
    //     const chats = database.collection('chat');
    
    //     const query = { _id: ObjectId("yourObjectIdHere") };
    //     const chat = await chats.findOne(query);
    //     console.log(chat);
    //   } catch (err) {
    //     console.error("Error connecting to MongoDB:", err.message);
    //   } finally {
    //     await client.close();
    //   }
    // }
    
    // run().catch(console.dir);
    



// const mongoose = require('mongoose');
// // 2. testDB 세팅
// const dbURI="mongodb://corn:corncorn*3@kbsco.pub-vpc.mg.naverncp.com:17017/corn";
// // const dbURI='mongodb://localhost:27017';
// // 3. 연결된 testDB 사용
// const connect = () => {
//     mongoose.connect(dbURI,
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true, 
//     serverSelectionTimeoutMS: 50000, // Timeout in milliseconds for server selection
//     }).then(() => console.log('MongoDB 연결 성공')).catch((err) => {
//       console.log(err);
//     });
//   };






// const wss = new WebSocketServer({ port: PORT });

// wss.on("connection", (ws, request) => {
//     wss.clients.forEach(client => {
//       client.send(`새로운 유저가 접속했습니다. 현재 유저 ${wss.clients.size} 명`)
//     })
  
//     console.log(`새로운 유저 접속: ${request.socket.remoteAddress}`)
//   });




















// const collection = db.collection('auto_sequence');

        //         // Find the document with _id 'auto_sequence' and increment the seq value
        //         collection.findOneAndUpdate(
        //             { _id: 'auto_sequence' },
        //             { $inc: { seq: 1 } },
        //             { returnDocument: 'after' }, // Return the updated document
        //             (err, result) => {
        //             if (err) {
        //                 console.error('Error updating sequence:', err);
        //                 return;
        //             }

        //             // Access the updated document and retrieve the new seq value
        //             const updatedDocument = result.value;
        //             const updatedSeqValue = updatedDocument.seq;

        //             console.log('Updated seq value:', updatedSeqValue);

        //             const chatMessage = {
        //                 "_id": updatedSeqValue,
        //                 "chatContent": chatContent,
        //                 "chatDate": chatDate,
        //                 "chatSpaceNo": chatSpaceNo,
        //                 "nickname": nickname,
        //                 "userId": userId,
        //                 "userImage": userImage,
        //                 "_class": "com.cornstory.domain.Chat"
        //             };

        //             // Insert the chat message into the 'chat' collection
        //             db.chat.insertOne(chatMessage, (err, result) => {
        //                 if (err) {
        //                 console.error('Error inserting chat message:', err);
        //                 } else {
        //                 console.log('Chat message inserted successfully:', result.insertedId);
        //                 }
        //             });
        //         });





// db.close();