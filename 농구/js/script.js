
var computer = {
    score: 0,
    percent2: 0.5,
    percent3: 0.33
};

var user = {
    score: 0,
    percent2: 0.5,
    percent3: 0.33
}

var game = {
    isComputerTurn: true,
    shotsLeft: 15
};

function onComputerShoot() {
    if(!game.isComputerTurn)
    return;

    updateAI();
    var shootType = Math.random() < 0.5 ? 2 : 3;

    if(Math.random() < computer['percent'+shootType]) {
        showtext('컴퓨터의 ' +shootType+ '점슛 성공');
        updateComputerScore(shootType)
    } else {
        showtext('컴퓨터의 ' +shootType+ '점슛 실패');
    }

    game.isComputerTurn = false;
    disableComputerButtons(true);
    disableUserButtons(false);
}

function onUserShoot(shootType){
    if(game.isComputerTurn)
    return;

    if(Math.random() < user['percent'+shootType]) {
        showtext('유저의 ' +shootType+ '점슛 성공');
        updateUserScore(shootType)
    } else {
        showtext('유저의 ' +shootType+ '점슛 실패');
    }

    game.isComputerTurn = true;
    disableComputerButtons(false);
    disableUserButtons(true);

    game.shotsLeft--;

    //var shotsLeftElem = document.getElementById('shots-left');
    var $shotsLeftElem = $('#shots-left');
    $shotsLeftElem.html(game.shotsLeft);

    if (game.shotsLeft === 0){
        if(user.score > computer.score) {
            showtext('승리');
        }
        else if(user.score < computer.score) {
            showtext('패배');
        }
        else {
            showtext('무승부');
        }

        disableComputerButtons(true);
        disableUserButtons(true);

    }
}

function showtext(a){
    //var textElem = document.getElementById("text");
    var $textElem = $('#text');
    $('#text').fadeOut(350, function(){
    $('#text').html(a);
    $('#text').fadeIn(100);
    });
}

function updateComputerScore(score){
    computer.score += score;
    //var comScoreElem = document.getElementById('computer-score');
    var $comScoreElem = $('#computer-score');

    $comScoreElem.animateNumber({
    number:computer.score
    });
}

function updateUserScore(score){
    user.score += score;
    //var userScoreElem = document.getElementById('user-score');
    var $userScoreElem = $('#user-score');

    $userScoreElem.animateNumber({
    number:user.score
    });
}

function disableComputerButtons(flag){
/*
    var computerButtons = document.getElementsByClassName('btn-computer');
    for(var i = 0; i < computerButtons.length; i++) {
        computerButtons[i].disabled = flag;
    }
    */
    $('.btn-computer').prop('disabled', flag);
}

function disableUserButtons(flag){
    $('.btn-user').prop('disabled', flag);
}

function updateAI(){
    var diff = user.score - computer.score;

    if(diff >= 10){
        computer.percent2 = 0.7;
        computer.percent3 = 0.5;
    } else if(diff >= 6){
        computer.percent2 = 0.6;
        computer.percent3 = 0.4;
    } else if(diff <= -10){
        computer.percent2 = 0.3;
        computer.percent3 = 0.23;
    } else if(diff <= -6){
        computer.percent2 = 0.4;
        computer.percent3 = 0.25;
    } else{
        computer.percent2 = 0.5;
        computer.percent3 = 0.33;
    }

}
$(function(){
    showtext(3);

    setTimeout(function(){
    showtext(2);

        setTimeout(function(){
            showtext(1);

            setTimeout(function(){
                showtext('컴퓨터부터 시작');
                disableComputerButtons(false);
            }, 1000);
        }, 1000);
    }, 1000);
});

