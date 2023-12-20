"use strict" //오류 줄이기
const socket = io(); //클라이언트 소켓이 담기게 됨

const userId = document.querySelector("#sessionUserId");
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


chatInput.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) {
    send();
  }
});

function send() {
  if (socket == undefined) {
    alert('서버에 연결되어 있지 않습니다. 먼저 서버에 연결하세요.');
    return;
  }

  const param = {
    userId: userId.value,
    chatContent: chatInput.value, 
    chatSpaceNo: chatSpaceNo.value, 
    nickname: nickname.value, 
    userImage:userImage.value
  };
  socket.emit("chatting", param); //채널이름

  chatInput.value = "";
}

sendButton.addEventListener("click", send);

slideOpen.addEventListener("click", () => {
  slideMenu.classList.toggle('on');//슬라이드 메뉴 감춤
});
closeSlideMenu.addEventListener("click", () => {
  slideMenu.classList.toggle('on');//슬라이드 메뉴 감춤
});

socket.on("chatting", (data)=>{ //여기 안에 서버에서 말한거 담김
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
    li.classList.add(userId.value === this.userId.value ? "sent":"received");
    const dom = `<span class="profile">
                <span class="user">${this.nickname}</span>
                <img name="userImage" class="userImage" src="static/file/chat${this.userImage}"></span>
                <span class="chatContent">${this.chatContent}</span>
                <span class="chatDate">${this.chatDate}</span>`;
    li.innerHTML = dom;
    chatList.appendChild(li);
  }
}







function addChat() {
  let chatSpaceNo = $("input[name='chatSpaceNo']").val();
  let chatContent = $("textarea[name='chatContent']").val();

  $.ajax({
      url: "/chat/json/addChat",
      method: "POST",
      dataType: "json",
      data: JSON.stringify({
          "chatSpaceNo": chatSpaceNo,
          "chatContent": chatContent
      }),
      contentType: "application/json; charset=utf-8",
      headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
      },
      success: function(JSONData, status) {

          let chat = "<div align='right'> <p class='ct_list_pop' align='left' " +
              "style='min-height: 100px; width: 40%; background-color: lightgray; padding : 5px; position: relative;'>" +
              "<span style='display: block; padding-bottom: 10px'>" +
              "<img src='/file/user/" + JSONData.userImage + "'> " + JSONData.nickname + "</span>" +
              JSONData.chatContent +
              "<span style='display: block; padding: 5px; position: absolute; bottom: 0; right: 0;'>" +
              JSONData.chatDate + "</span></p></div>";

          $(".chatList").append(chat);
          $("textarea[name='chatContent']").val("");
      },
      error: function(status) {

          //Debug...
          alert("error");
      }
  });
}