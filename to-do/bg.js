const body = document.querySelector("body");
const IMG_NUMBER = 5;

function paintImage(imgNumber) {
  const image = new Image();
  image.src = `images/${imgNumber + 1}.jpg`;
  image.classList.add("bgImage");
  body.appendChild(image);
}

//이미지 개수만큼의 숫자를 생성(0,1,2...)
function genRandom() {
  const number = Math.floor(Math.random() * IMG_NUMBER);
  return number;
}
//동일한 숫자를 가진 이미지를 실행
function init() {
  const randomNumber = genRandom();
  paintImage(randomNumber);
}

init();
