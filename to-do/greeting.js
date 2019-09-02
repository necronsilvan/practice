const form = document.querySelector(".js-form"),
  input = form.querySelector("input"),
  greeting = document.querySelector(".js-greetings");

const USER_LS = "currentUser",
  SHOWING_CN = "showing";

//이름을 저장하는 함수
function saveName(text) {
  localStorage.setItem(USER_LS, text);
}

//폼에 값을 입력했을시의 동작을 세팅
function handleSubmit(event) {
  //submit에 의해 새로고침되는 기본동작을 막기위해 preventDefault 함수 사용.
  event.preventDefault();
  const currentValue = input.value;
  paintGreeting(currentValue);
  saveName(currentValue);
}

//이름을 묻는 함수
function askForName() {
  form.classList.add(SHOWING_CN);
  form.addEventListener("submit", handleSubmit);
}
//폼을 보이지 않게하고 이름 텍스트를 출력한다.
function paintGreeting(text) {
  form.classList.remove(SHOWING_CN);
  greeting.classList.add(SHOWING_CN);
  greeting.innerText = `Hello ${text}`;
}

function loadName() {
  const currentUser = localStorage.getItem(USER_LS);
  if (currentUser === null) {
    askForName();
  } else {
    paintGreeting(currentUser);
  }
}

function init() {
  loadName();
}

init();
