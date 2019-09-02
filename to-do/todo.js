const toDoForm = document.querySelector(".js-toDoForm"),
  toDoInput = toDoForm.querySelector("input"),
  toDoList = document.querySelector(".js-toDoList");

const TODOS_LS = "toDos";
let toDos = []; //갱신 가능한 배열이어야 하므로 변수 let을 쓴다

//저장된 할일 목록을 지운다
function deleteToDo(event) {
  const btn = event.target;
  const li = btn.parentNode; //(event.target.parentNode와 동일. 누른 버튼의 부모노드를 찾아감)
  toDoList.removeChild(li); // ul 클래스 toDoList(js-toDoList)의 자식인 -선택된-리스트를 지운다
  const cleanToDos = toDos.filter(function(toDo) {
    //filter를 통해 삭제된 id를 제외한 나머지를 남긴다.
    return toDo.id !== parseInt(li.id); //li.id가 문자열이므로 함수를 통해 숫자로 변환
  });
  toDos = cleanToDos; //저장된 배열을 삭제를 실행한 현재 배열로 덮어씀
  saveToDos();
}

//입력을 jason을 통해 string으로 저장
function saveToDos() {
  localStorage.setItem(TODOS_LS, JSON.stringify(toDos));
}
//입력받은 정보를 화면에 li로 출력
function paintToDo(text) {
  const list = document.createElement("li");
  const delBtn = document.createElement("button");
  const span = document.createElement("span");
  const newId = toDos.length + 1;
  delBtn.innerText = "X";
  delBtn.addEventListener("click", deleteToDo);
  span.innerText = text + " ";
  list.appendChild(span);
  list.appendChild(delBtn);
  list.id = newId;
  toDoList.appendChild(list);
  const toDoObj = {
    text: text,
    id: newId
  };
  toDos.push(toDoObj);
  saveToDos();
}
//값을 입력한 후 입력창을 비워준다
function handleSubmit(event) {
  event.preventDefault();
  const currentValue = toDoInput.value;
  paintToDo(currentValue);
  toDoInput.value = "";
}
//저장된 데이터를 불러옴
function loadToDos() {
  const loadedToDos = localStorage.getItem(TODOS_LS);
  if (loadedToDos !== null) {
    //string으로 저장된 데이터를 jason을 통해 오브젝트로 변환
    const parsedToDos = JSON.parse(loadedToDos);
    //forEach를 사용해 배열의 모든 리스트에 함수를 적용
    parsedToDos.forEach(function(toDo) {
      paintToDo(toDo.text);
    });
  }
}

function init() {
  loadToDos();
  toDoForm.addEventListener("submit", handleSubmit);
}

init();
