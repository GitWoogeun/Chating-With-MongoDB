// 로그인 시스템 대신 임시 방편
let username = prompt("아이디를 입력하세요");
let roomNum = prompt("채팅방 번호를 입력하세요");

document.querySelector("#username").innerHTML = username;

// SSE 연결하기
const eventSource = new EventSource(`http://localhost:8080/chat/roomNum/${roomNum}`);
eventSource.onmessage = (event) => {
	const data = JSON.parse(event.data);
	if (data.sender === username) { // 로그인한 유저가 보낸 메시지
		// 파란박스(오른쪽)
		initMyMessage(data);ㄷ탸
	} else {
		// 회색박스(왼쪽)
		initYourMessage(data);
	}
}

// TimeZone을 한국시간으로 변경 함수
function getKoreanTime() {
    const kst = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
    return new Date(kst);
}

// 요일 구하는 함수
function getDayName() {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const now = new Date();
    const dayIndex = now.getDay();
    const dayName = dayNames[dayIndex];
    return dayName;
}

// 오전 / 오후 구하는 함수
function getAmPm(time) {
    var date = new Date();
    var hours = date.getHours();
    var ampm = hours >= 12 ? '오후' : '오전';
  
    return ampm;
}

// 한국시간을 가져오는 함수
function getKSTTime(){
    let kst = getKoreanTime();

    let year = kst.getFullYear();
    let month = kst.getMonth()+1;
    let day   = kst.getDate();
    let dayName = getDayName();
    let ampm    = getAmPm();
    let hour  = kst.getHours();
    let minutes = kst.getMinutes();

    let kstTime = year +"년 "+month+"월 "+day+"일 "+`(${dayName}요일) `+ ampm + " "+hour+":"+minutes
    return kstTime;
}

// 파란박스 만들기
function getSendMsgBox(data) {

    let kstTime = getKSTTime();

    return `<div class="sent_msg">
    <p>${data.msg}</p>
    <span class="time_date">${kstTime}  ${data.sender}</span>
</div>`;
}

// 회색박스 만들기
function getReceiveMsgBox(data) {

    let kstTime = getKSTTime();

    return `<div class="received_msg">
    <p>${data.msg}</p>
    <span class="time_date">${kstTime}  ${data.sender}</span>
</div>`;
}

// 최초 초기화될 때 1번방 3건이 있으면 3건을 다 가져와요
// addMessage() 함수 호출시 DB에 Insert 되고, 그 데이터가 자동으로 흘러 들어와요(SSE니까)
// 파란박스 초기화 하기
function initMyMessage(data) {
    let chatBox = document.querySelector("#chat-box");

    let sendBox = document.createElement("div");
    sendBox.className = "outgoing_msg";
    
    sendBox.innerHTML = getSendMsgBox(data);
    chatBox.append(sendBox);
}

// 회색박스 초기화 하기
function initYourMessage(data) {
    let chatBox = document.querySelector("#chat-box");

    let receivedBox = document.createElement("div");
    receivedBox.className = "incoming_msg";
    
    receivedBox.innerHTML = getReceiveMsgBox(data);
    chatBox.append(receivedBox);
}

// AJAX로 채팅 메시지를 전송
// ROOMNUMBER로 전송
async function addMessage() {
    let msgInput = document.querySelector("#chat-outgoing-msg");
     
    // 비동기함수
    let chat = {
        sender: username,
        roomNum: roomNum,
        msg:msgInput.value
    };

    // 통신
    fetch("http://localhost:8080/chat",{
        method:"post",//http post 메소드 (새로운 데이터를 write)할 때 쓰는 함수
        body:JSON.stringify(chat),   // JS -> JSON으로 변경
        headers:{
            "Content-Type":"application/json; charset=utf-8"
        }
    });

    msgInput.value="";
}
 
// 버튼 클릭 시 메시지 전송
document.querySelector("#chat-send-button").addEventListener("click",()=>{
    addMessage();
});


// 엔터를 입력하면 메시지 전송
document.querySelector("#chat-outgoing-msg").addEventListener("keydown",(e)=>{
    if(e.keyCode==13){
        addMessage();
    }
});