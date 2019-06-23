var list = [];

for(var i = 1; i <= 45; i++){
    list.push(i);
}

var result = [];
//랜덤 선택을 위한 수식
for (var i = 0; i < 6; i++) {
    var index = Math.floor(Math.random() * list.length);

    //랜덤으로 선택된 값
    var num = list[index];
    //배열에서 값을 뺀다
    list.splice(index, 1);
    //빈 배열에 숫자 담기
    result.push(num);
}

result.sort(function(a,b){
    return a-b;
});

for (var i = 0; i < 6; i++){
    document.write('<span class="ball">' + result[i] + '</span>');
}


