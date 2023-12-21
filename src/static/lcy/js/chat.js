"use strict" //오류 줄이기
const socket = io(); //클라이언트 소켓이 담기게 됨


const sessionUserId = document.querySelector("#sessionUserId");
const chatList = document.querySelector(".chatting-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");
const slideOpen = document.querySelector(".slide-open");
const slideMenu = document.querySelector(".slideMenu");
const closeSlideMenu = document.querySelector(".closeSlideMenu");

const chatSpaceNo = document.querySelector(".chatSpaceNo");
const nickname = document.querySelector("#nickname");
const userImage = document.querySelector("#userImage");

const searchButton = document.querySelector("#searchButton");
const searchKeyword = document.querySelector("#searchKeyword");

displayContainer.scrollTo(0, displayContainer.scrollHeight);

chatInput.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) {
    send();
  }
});

searchKeyword.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) {
    search();
  }
});

searchButton.addEventListener("click", () => {
  search();
});

function search() {
  // if (searchKeyword.value == "") {
  //   alert("내용을 입력해주세요.");
  //   return;
  // }

  const param = {
    chatSpaceNo:chatSpaceNo.value,
    searchKeyword:searchKeyword.value
  };
  console.log("param : "+param.chatSpaceNo+", "+param.searchKeyword);
  socket.emit("search", param); //채널이름
}

function send() {
  if (socket == undefined) {
    console.log('서버에 연결되어 있지 않습니다. 먼저 서버에 연결하세요.');
    return;
  }
  console.log(chatInput.value);
  if (chatInput.value == "") {
    alert("내용을 입력해주세요.");
    return;
  }

  const param = {
    userId: sessionUserId.value,
    chatContent: chatInput.value, 
    chatSpaceNo: chatSpaceNo.value, 
    nickname: nickname.value, 
    userImage:userImage.value,
    chatSpaceNo:chatSpaceNo.value
  };
  socket.emit("message", param); //채널이름

  chatInput.value = "";
}

sendButton.addEventListener("click", send);

slideOpen.addEventListener("click", () => {
  slideMenu.classList.toggle('on');//슬라이드 메뉴 감춤
});
closeSlideMenu.addEventListener("click", () => {
  slideMenu.classList.toggle('on');//슬라이드 메뉴 감춤
});

socket.on("message", (data)=>{ //여기 안에 서버에서 말한거 담김
  const {userId, chatContent, chatDate, nickname, userImage} = data;
  const item = new LiModel(userId, chatContent, chatDate, nickname, userImage);
  
  item.makeLi();
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
}); //서버에서 말하는거 받아줄때

function LiModel(userId, chatContent, chatDate, nickname, userImage) {
  this.userId = userId;
  this.chatContent = chatContent;
  this.chatDate = chatDate;
  this.nickname = nickname;
  this.userImage = userImage;

  this.makeLi = () => {
    const li = document.createElement("li");
    
    li.classList.add(sessionUserId.value === this.userId ? "sent":"received");
    const dom = `<span class="profile">
                <span class="user">${this.nickname}</span>
                <img name="userImage" class="userImage" src="static/file/chat${this.userImage}"></span>
                <span class="chatContent">${this.chatContent}</span>
                <span class="chatDate">${this.chatDate}</span>`;
    li.innerHTML = dom;
    chatList.appendChild(li);
  }
}


socket.on("search", (chats)=>{ //여기 안에 서버에서 말한거 담김
  console.log("chat.js: chats :: "+chats);
  chatList.innerHTML = "";
  searchLiModel(chats);
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
}); //서버에서 말하는거 받아줄때

function searchLiModel(chats) {
  for (let i = 0; i < chats.length; i++) {
    const li = document.createElement("li");
    
    li.classList.add(sessionUserId.value === chats[i].userId ? "sent":"received");
    const dom = `<input type="hidden" name="userId" value="${chats[i].userId}">
                  <input type="hidden" name="nickname" value="${chats[i].nickname}">
                  <span class="profile">
                      <span class="user">${chats[i].nickname}</span>
                      <img name="userImage" class="userImage" src="static/file/chat/${chats[i].userImage}">
                  </span>
                  <span class="chatContent">${chats[i].chatContent}</span>
                  <span class="chatDate">${chats[i].chatDate}</span>`;
    li.innerHTML = dom;
    chatList.appendChild(li);
  }
}
