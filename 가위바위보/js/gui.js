// 사용자와 컴퓨터의 패 입력
var SCISSORS = '가위';
var ROCK = '바위';
var PAPER = '보';

function onButtonClick(userInput){
    var comInput;
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
//리팩토링
var test = '컴퓨터가 ' + comInput;
if (userInput === SCISSORS){
    if (comInput === SCISSORS){
    test += '를 냈습니다.비겼군요';
    }
    else if (comInput === ROCK){
    test += '를 냈습니다.졌네요';
    }
    else {
    test += '를 냈습니다.이겼군요';
    }
}
else if (userInput === ROCK){
    if(comInput === SCISSORS){
    test += '를 냈습니다.이겼군요';
    }
    else if (comInput === ROCK){
    test += '를 냈습니다.비겼군요';
    }
    else {
    test += '를 냈습니다.졌네요';
    }

}
else {
    if(comInput === SCISSORS){
    test += '를 냈습니다.졌네요';
    }
    else if (comInput === ROCK){
    test += '를 냈습니다.이겼군요';
    }
    else {
    test += '를 냈습니다.비겼군요';
    }
}
alert(test);
}