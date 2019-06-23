// 사용자와 컴퓨터의 패 입력
var SCISSORS = '가위';
var ROCK = '바위';
var PAPER = '보';

var userInput = prompt('가위 바위 보');

if (userInput !== SCISSORS && userInput !== ROCK && userInput !== PAPER){
alert('유효한 값을 입력하세요');
}
else{

var comInput;
// 0부터 1사이의 값을 리턴함
var rand = Math.random();

if (rand < 0.33){
    comInput = SCISSORS;
}
else if (rand < 0.66){
    comInput = ROCK;
}
else {
    comInput = PAPER;
}
//패를 비교
if (userInput === SCISSORS){
    if (comInput === SCISSORS){
    alert('컴퓨터가 '+comInput+'를 냈습니다.비겼군요');
    }
    else if (comInput === ROCK){
    alert('컴퓨터가 '+comInput+'를 냈습니다.졌네요');
    }
    else {
    alert('컴퓨터가 '+comInput+'를 냈습니다.이겼군요');
    }
}
else if (userInput === ROCK){
    if(comInput === SCISSORS){
    alert('컴퓨터가 '+comInput+'를 냈습니다.이겼군요');
    }
    else if (comInput === ROCK){
    alert('컴퓨터가 '+comInput+'를 냈습니다.비겼군요');
    }
    else {
    alert('컴퓨터가 '+comInput+'를 냈습니다.졌네요');
    }

}
else {
    if(comInput === SCISSORS){
    alert('컴퓨터가 '+comInput+'를 냈습니다.졌네요');
    }
    else if (comInput === ROCK){
    alert('컴퓨터가 '+comInput+'를 냈습니다.이겼군요');
    }
    else {
    alert('컴퓨터가 '+comInput+'를 냈습니다.비겼군요');
    }
}

}

