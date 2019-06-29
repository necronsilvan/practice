var comScore = 0;
var userScore = 0;
var isComputerTurn = true;

function onComputerShoot() {
    if(!isComputerTurn)
    return;

    var textElem = document.getElementById('text');
    var comScoreElem = document.getElementById('computer-score');
    var shootType = Math.random() < 0.5 ? 2 : 3;

    if (shootType === 2){
        if (Math.random() < 0.5){
            textElem.innerHTML = '컴퓨터가 2점슛 성공';
            comScore += 2;
            comScoreElem.innerHTML = comScore;
        } else {
            textElem.innerHTML = '컴퓨터가 2점슛 실패';
        }
    } else {
        if (Math.random() < 0.33){
            textElem.innerHTML = '컴퓨터가 3점슛 성공';
            comScore += 3;
            comScoreElem.innerHTML = comScore;
        } else {
            textElem.innerHTML = '컴퓨터가 3점슛 실패';
        }
    }
    isComputerTurn = false;
}

function onUserShoot(shootType){
    if(isComputerTurn)
    return;

    var textElem = document.getElementById('text');
    var userScoreElem = document.getElementById('user-score');

    if (shootType === 2){
        if (Math.random() < 0.5){
                textElem.innerHTML = '2점슛 성공';
                userScore += 2;
                userScoreElem.innerHTML = userScore;
        } else {
                textElem.innerHTML = '2점슛 실패';
        }
        } else {
            if (Math.random() < 0.33){
                textElem.innerHTML = '3점슛 성공';
                userScore += 3;
                userScoreElem.innerHTML = userScore;
        } else {
                textElem.innerHTML = '3점슛 실패';
        }
    }
    isComputerTurn = true;
}
