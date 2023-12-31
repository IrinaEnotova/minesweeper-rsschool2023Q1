"use strict";

// COMMON

const sidebar = document.createElement("aside"),
  main = document.createElement("main"),
  infoPanel = document.createElement("div"),
  modal = document.createElement("div"),
  resultsModal = document.createElement("div");

document.body.classList.add("wrapper");
sidebar.classList.add("sidebar");
main.classList.add("main");
infoPanel.classList.add("info-panel");
modal.classList.add("modal");
modal.innerHTML = `
<div class="modal-container">
  <h2 class="modal-heading">Модальное окно</h2>
</div>
`;
resultsModal.classList.add("modal-results");
resultsModal.innerHTML = `
<div class="modal-results-container">
  <h2 class="modal-heading">Results</h2>
</div>
`;

document.body.append(sidebar);
document.body.append(infoPanel);
document.body.append(main);
document.body.append(modal);
document.body.append(resultsModal);

// SIDEBAR

function createElement(tagName, parentSelector, classes) {
  const element = document.createElement(tagName);
  element.className = classes;
  document.querySelector(parentSelector).append(element);

  return element;
}

const welcome = createElement("h1", ".sidebar", "main-heading");
const startBtn = createElement("button", ".sidebar", "start-btn btn");
startBtn.textContent = "New game";

const timerContainer = createElement("div", ".info-panel", "timer-container"),
  timerTitle = createElement("div", ".timer-container", "panel-title"),
  timerValue = createElement("div", ".timer-container", "timer-value"),
  minutes = createElement("div", ".timer-value", "minutes"),
  seconds = createElement("div", ".timer-value", "seconds");

const numberOfClicks = createElement("div", ".info-panel", "clicks-container"),
  clickTitle = createElement("div", ".clicks-container", "panel-title"),
  clickValue = createElement("div", ".clicks-container", "clicks");

timerTitle.textContent = "Time:";
clickTitle.textContent = "Moves:";
minutes.textContent = "00:";
seconds.textContent = "00";
clickValue.textContent = "0";

const soundContainer = createElement("div", ".main", "sound-container"),
  soundImg = createElement("img", ".sound-container", "sound-img");
if (localStorage.getItem("sound") === "true") {
  soundImg.src = "assets/img/sound-on.png";
} else if (localStorage.getItem("sound") === "false") {
  soundImg.src = "assets/img/mute.png";
} else {
  soundImg.src = "assets/img/sound-on.png";
}

const themeContainer = createElement("div", ".main", "theme-container"),
  themeImg = createElement("img", ".theme-container", "theme-img");
if (localStorage.getItem("theme") === "dark") {
  themeImg.src = "assets/img/dark.svg";
} else if (localStorage.getItem("theme") === "light") {
  themeImg.src = "assets/img/light.svg";
} else {
  themeImg.src = "assets/img/light.svg";
}

const results = createElement("div", ".main", "results-container"),
  resultsImg = createElement("img", ".results-container", "results-img");
resultsImg.src = "assets/img/medal.png";

// TIMER AND CLICKS
let timer = 0;
let timerInterval;

function setStopwatch() {
  timerInterval = setInterval(function () {
    timer += 1;
    let secondVal = Math.floor(timer) - Math.floor(timer / 60) * 60;
    let minuteVal = Math.floor(timer / 60);
    seconds.innerHTML = secondVal < 10 ? "0" + secondVal : secondVal;
    minutes.innerHTML = minuteVal < 10 ? "0" + minuteVal + ":" : minuteVal + ":";
  }, 1000);
}

setStopwatch();

// MAIN WINDOW

const field = createElement("div", ".main", "game-field");
let width = 10;
let bombAmount = 10;
let flags = 0;
let squares = [];
let closedSquares = [];
let isGameOver = false;
let isWin = false;

const audioDig = new Audio("assets/audio/shovel-dig.mp3");
const audioBoom = new Audio("assets/audio/boom.mp3");
const audioFlag = new Audio("assets/audio/flag.mp3");
const audioClick = new Audio("assets/audio/click.mp3");
const audioWin = new Audio("assets/audio/win.mp3");
let sound = localStorage.getItem("sound") ? localStorage.getItem("sound") : "true";
let theme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "light";
let latestResults = localStorage.getItem("results") ? localStorage.getItem("results") : " ";

localStorage.setItem("sound", sound);
localStorage.setItem("theme", theme);
localStorage.setItem("results", latestResults);

function createBoard() {
  const bombsArray = Array(bombAmount).fill("bomb");
  const emptyArray = Array(width * width - bombAmount).fill("valid");

  const gameArray = [...emptyArray, ...bombsArray];
  closedSquares = [...emptyArray, ...bombsArray];
  const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

  for (let i = 0; i < width * width; i++) {
    const square = document.createElement("div");
    square.setAttribute("id", i);
    square.classList.add(shuffledArray[i]);
    square.classList.add("cell");
    square.classList.add("hidden-square");
    field.append(square);
    squares.push(square);

    square.addEventListener("click", () => {
      click(square);
    });

    square.oncontextmenu = function (event) {
      event.preventDefault();
      addFlag(square);
    };
  }

  for (let i = 0; i < squares.length; i++) {
    let total = 0;
    const isLeftEdge = i % width === 0;
    const isRightEdge = i % width === width - 1;
    if (squares[i].classList.contains("valid")) {
      if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains("bomb")) total++;
      if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains("bomb")) total++;
      if (i > 10 && squares[i - width].classList.contains("bomb")) total++;
      if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains("bomb")) total++;
      if (i < 98 && !isRightEdge && squares[i + 1].classList.contains("bomb")) total++;
      if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains("bomb")) total++;
      if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains("bomb")) total++;
      if (i < 89 && squares[i + width].classList.contains("bomb")) total++;
      squares[i].setAttribute("data", total);
    }
  }
}

function removeSquares() {
  squares.forEach((square) => {
    square.remove();
  });
}

createBoard();

function addFlag(square) {
  if (isGameOver) return;
  if (!square.classList.contains("checked") && flags < bombAmount) {
    if (!square.classList.contains("flag")) {
      if (sound === "true") {
        audioFlag.play();
      }
      square.classList.add("flag");
      flags++;
      checkForWin();
    } else {
      square.classList.remove("flag");
      flags--;
    }
  }
}

function click(square) {
  let currentId = square.id;
  if (isGameOver) return;

  closedSquares = [];
  squares.forEach((item) => {
    if (!item.classList.contains("checked")) {
      closedSquares.push(item);
    }
  });
  checkForWin();

  if (square.classList.contains("checked") || square.classList.contains("flag")) return;
  if (square.classList.contains("bomb")) {
    gameOver(square);
  } else {
    if (sound === "true") {
      audioDig.play();
    }
    let total = square.getAttribute("data");
    if (total != 0) {
      square.classList.add("checked");
      if (total == 1) square.classList.add("one");
      if (total == 2) square.classList.add("two");
      if (total == 3) square.classList.add("three");
      if (total == 4) square.classList.add("four");
      if (total == 5) square.classList.add("five");
      if (total == 6) square.classList.add("six");
      if (total == 7) square.classList.add("seven");
      if (total == 8) square.classList.add("eight");
      square.innerHTML = total;
      return;
    }
    checkSquare(square, currentId);
  }
  square.classList.add("checked");
}

function checkSquare(square, currentId) {
  const isLeftEdge = currentId % width === 0;
  const isRightEdge = currentId % width === width - 1;

  setTimeout(() => {
    if (currentId > 0 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId > 9 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1 - width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId > 10) {
      const newId = squares[parseInt(currentId) - width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId > 11 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1 - width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId < 98 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId < 90 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1 + width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId < 88 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1 + width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if (currentId < 89) {
      const newId = squares[parseInt(currentId) + width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
  }, 10);
}

// game over
function gameOver(square) {
  clearInterval(timerInterval);
  squares.forEach((square) => {
    square.removeEventListener("click", addMoves);
  });
  if (sound === "true") {
    audioBoom.play();
  }
  isGameOver = true;
  modal.innerHTML = `
  <div class="modal-container">
    <h2 class="modal-heading">Game over!</h2>
  </div>
  `;
  modal.classList.add("active-modal");
  squares.forEach((square) => {
    if (square.classList.contains("bomb")) {
      square.classList.add("bomb-img");
    }
  });
}

let oldResults = localStorage.getItem("results");
let currentResult;

function checkForWin() {
  let matches = 0;

  for (let i = 0; i < squares.length; i++) {
    if (squares[i].classList.contains("flag") && squares[i].classList.contains("bomb")) {
      matches++;
    }
    if (matches === bombAmount) {
      modal.innerHTML = `
      <div class="modal-container">
        <h2 class="modal-heading">You win!</h2>
      </div>
      `;
      modal.classList.add("active-modal");
      if (sound === "true") {
        audioWin.play();
      }
      clearInterval(timerInterval);
      squares.forEach((square) => {
        square.removeEventListener("click", addMoves);
      });
      isWin = true;
      isGameOver = true;
    }
    if (closedSquares.length - 1 === bombAmount) {
      modal.innerHTML = `
      <div class="modal-container">
        <h2 class="modal-heading">You win!</h2>
      </div>
      `;
      modal.classList.add("active-modal");
      if (sound === "true") {
        audioWin.play();
      }
      clearInterval(timerInterval);
      squares.forEach((square) => {
        square.removeEventListener("click", addMoves);
      });
      isWin = true;
      isGameOver = true;

      currentResult = `Time ${minutes.textContent}${seconds.textContent} and ${clickValue.textContent} moves;\n`;
    }
  }
}

// EVENTS

startBtn.addEventListener("click", () => {
  location.reload();
  if (sound === "true") {
    audioClick.play();
  }
});

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    modal.classList.remove("active-modal");
  }
  if (event.target == resultsModal) {
    resultsModal.classList.remove("active-modal");
  }
});

squares.forEach((square) => {
  square.addEventListener("click", addMoves);
});

function addMoves() {
  clickValue.textContent = +clickValue.textContent + 1;
}

soundContainer.addEventListener("click", () => {
  if (sound === "true") {
    sound = "false";
    soundImg.src = "assets/img/mute.png";
  } else {
    sound = "true";
    soundImg.src = "assets/img/sound-on.png";
  }
});

themeContainer.addEventListener("click", () => {
  if (theme === "light") {
    theme = "dark";

    sidebar.classList.add("dark-sidebar");
    startBtn.classList.add("dark-btn");
    infoPanel.classList.add("dark-btn");
    timerTitle.classList.add("dark-btn");
    minutes.classList.add("dark-btn");
    seconds.classList.add("dark-btn");
    clickTitle.classList.add("dark-btn");
    clickValue.classList.add("dark-btn");
    main.classList.add("dark-main");
    squares.forEach((square) => {
      square.classList.add("dark-hidden-square");
    });

    themeImg.src = "assets/img/dark.svg";
  } else {
    theme = "light";

    sidebar.classList.remove("dark-sidebar");
    startBtn.classList.remove("dark-btn");
    infoPanel.classList.remove("dark-btn");
    timerTitle.classList.remove("dark-btn");
    minutes.classList.remove("dark-btn");
    seconds.classList.remove("dark-btn");
    clickTitle.classList.remove("dark-btn");
    clickValue.classList.remove("dark-btn");
    main.classList.remove("dark-main");
    squares.forEach((square) => {
      square.classList.remove("dark-hidden-square");
    });

    themeImg.src = "assets/img/light.svg";
  }
});

let resultArr = localStorage.getItem("results").split(";");
resultArr.forEach((result, i) => {
  if (i < resultArr.length - 1) {
    let element = document.createElement("div");
    element.classList.add("result-text");
    element.textContent = `${i + 1}.${result}`;
    document.querySelector(".modal-results-container").append(element);
  }
});

results.addEventListener("click", () => {
  resultsModal.classList.toggle("active-modal");
});

window.addEventListener("unload", () => {
  localStorage.setItem("sound", sound);
  if (isWin) {
    let storageResult = oldResults + currentResult;
    localStorage.setItem("results", storageResult);
  }
});
