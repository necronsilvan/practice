const weather = document.querySelector(".js-weather");

const API_KEY = "81f819d10aa352cc8a38ea11d751cb25";
const COORDS = "coords";

function getWether(lat, lng) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
  ) //fetch 호출 완료까지 대기
    .then(function(response) {
      return response.json();
    }) //json을 로드할때까지 대기
    .then(function(json) {
      const temperature = json.main.temp;
      const place = json.name;
      weather.innerText = `${temperature} @ ${place}`;
    });
}

//jason으로 변환하여 위치(오브젝트) 데이터를 저장
function saveCoords(coordsObj) {
  localStorage.setItem(COORDS, JSON.stringify(coordsObj));
}

//데이터를 불러오는데 성공할시
function handleGeoSucces(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const coordsObj = {
    latitude,
    longitude
  };
  saveCoords(coordsObj);
  getWether(latitude, longitude);
}
//데이터를 불러오는데 실패할시
function handleGeoError() {
  console.log("위치 정보를 찾지 못했습니다");
}

//지역을 체크
function askForCoords() {
  navigator.geolocation.getCurrentPosition(handleGeoSucces, handleGeoError);
}

//지역 데이터를 불러옴
function loadCoords() {
  const loadedCoords = localStorage.getItem(COORDS);
  if (loadedCoords === null) {
    askForCoords();
  } else {
    const parsedCoords = JSON.parse(loadedCoords);
    getWether(parsedCoords.latitude, parsedCoords.longitude);
  }
}

function init() {
  loadCoords();
}

init();
