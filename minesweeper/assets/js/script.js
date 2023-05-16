'use strict';

// COMMON

const sidebar = document.createElement('aside'),
      main = document.createElement('main');

document.body.classList.add('wrapper');
sidebar.classList.add('sidebar');
main.classList.add('main');

document.body.append(sidebar);
document.body.append(main);

// SIDEBAR

function createElement(tagName, parentSelector, classes) {
  const element = document.createElement(tagName);
  console.log(element);
  element.className = classes;
  document.querySelector(parentSelector).append(element);

  return element;
}

const welcome = createElement('h1', '.sidebar', 'main-heading');
welcome.textContent = "Minesweeper";

const startBtn = createElement('button', '.sidebar', 'start-btn btn');
startBtn.textContent = 'New game';

const levels = createElement('div', '.sidebar', 'levels-container hidden'),
      levelHeading = createElement('h2', '.levels-container', 'add-heading'),
      btnsContainer = createElement('div', '.levels-container', 'btns-container'),
      easyLevelBtn = createElement('button', '.btns-container', 'level-btn easy-level btn'),
      mediumLevelBtn = createElement('button', '.btns-container', 'level-btn medium-level btn'),
      hardLevelBtn = createElement('button', '.btns-container', 'level-btn hard-level btn');
const levelBtns = [];

levelHeading.textContent = 'Difficulty';
easyLevelBtn.textContent = 'Easy 10x10';
levelBtns.push(easyLevelBtn);
mediumLevelBtn.textContent = 'Medium 15x15';
levelBtns.push(mediumLevelBtn);
hardLevelBtn.textContent = 'Hard 25x25';
levelBtns.push(hardLevelBtn);

// MAIN WINDOW

const field = createElement('div', '.main', 'game-field');
// for easy mode 10x10
let width = 10;
let bombAmount = 20;
let flags = 0;
let squares = [];
let isGameOver = false;

const audioDig = new Audio('assets/audio/shovel-dig.mp3');
const audioBoom = new Audio('assets/audio/boom.mp3');
const audioFlag = new Audio('assets/audio/flag.mp3');
const audioClick = new Audio('assets/audio/click.mp3');
const audioWin = new Audio('assets/audio/win.mp3');

function createBoard() {
  // create bombs and valid cells
  const bombsArray = Array(bombAmount).fill('bomb');
  const emptyArray = Array(width*width - bombAmount).fill('valid');
  // console.log(bombsArray);
  // console.log(emptyArray);

  // random position for bombs
  const gameArray = [...emptyArray, ...bombsArray];
  console.log(gameArray);
  const shuffledArray = gameArray.sort(() => Math.random() - 0.5);
  console.log(shuffledArray);


  for(let i = 0; i < width*width; i++) {
    const square = document.createElement('div');
    square.setAttribute('id', i);
    // присваеваем ячейкам класс, соответствующий номеру в перемешанном массиве
    square.classList.add(shuffledArray[i]);
    square.classList.add('cell')
    field.append(square);
    squares.push(square);

    // click
    square.addEventListener('click', () => {
      click(square);
    })

    // left click
    square.oncontextmenu = function(event) {
      event.preventDefault();
      addFlag(square);
    }
  }

  // add numbers
  for(let i = 0; i < squares.length; i++) {
    let total = 0;
    // определяем крайние ячейки
    const isLeftEdge = i % width === 0;
    const isRightEdge = i % width === width - 1;
// тут нужно продумать варианты с другими размерами поля
    if(squares[i].classList.contains('valid')) {
      if(i > 0 && !isLeftEdge && squares[i-1].classList.contains('bomb')) total++;
      if(i > 9 && !isRightEdge && squares[i+1 - width].classList.contains('bomb')) total++;
      if(i > 10 && squares[i - width].classList.contains('bomb')) total++;
      if(i > 11 && !isLeftEdge && squares[i-1 - width].classList.contains('bomb')) total++;
      if(i < 98 && !isRightEdge && squares[i+1].classList.contains('bomb')) total++;
      if(i < 90 && !isLeftEdge && squares[i-1 + width].classList.contains('bomb')) total++;
      if(i < 88 && !isRightEdge && squares[i+1 + width].classList.contains('bomb')) total++;
      if(i < 89 && squares[i + width].classList.contains('bomb')) total++;
      squares[i].setAttribute('data', total);
      console.log(squares[i]);
    }
  }

}

createBoard();

// add flag with right click
function addFlag(square) {
  if(isGameOver) return;
  if(!square.classList.contains('checked') && flags < bombAmount) {
    if(!square.classList.contains('flag')) {
      audioFlag.play();
      square.classList.add('flag');
      console.log('!')
      // DELETE
      square.innerHTML = 'Flag';
      flags++;
      checkForWin();
    } else {
      square.classList.remove('flag');
      square.innerHTML = '';
      flags--;
    }
  }
}

function click(square) {
  let currentId = square.id;
  if(isGameOver) return;
  if(square.classList.contains('checked') || square.classList.contains('flag')) return;
  if(square.classList.contains('bomb')) {
    // сделать вывод окна с завершением игры
    gameOver(square);
  } else {
    audioDig.play();
    let total = square.getAttribute('data');
    if(total != 0) {
      square.classList.add('checked');
      square.innerHTML = total;
      return
    }
    // сначала проверяем ячейки по соседству
    checkSquare(square, currentId);
  }
  square.classList.add('checked');
}

// функция для проверки соседей с помощью рекурсии
function checkSquare(square, currentId) {
  const isLeftEdge = currentId % width === 0;
  const isRightEdge = currentId % width === width - 1;

  setTimeout(() => {
    if(currentId > 0 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId > 9 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1 - width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId > 10) {
      const newId = squares[parseInt(currentId - width)].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId > 11 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1 - width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId < 98 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId < 90 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1 + width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId < 88 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1 + width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
    if(currentId < 89) {
      const newId = squares[parseInt(currentId) + width].id;
      const newSquare = document.getElementById(newId);
      click(newSquare);
    }
  }, 10)
}

// game over
function gameOver(square) {
  console.log('BOOM! Game over!');
  audioBoom.play();
  isGameOver = true;

  // show ALL bombs in the end
  squares.forEach(square => {
    if(square.classList.contains('bomb')) {
      square.innerHTML = '!';
    }
  })
}

// check for win
function checkForWin() {
  let matches = 0;

  for(let i = 0; i < squares.length; i++) {
    if(squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
      matches++;
    }
    if(matches === bombAmount) {
      console.log('You win!');
      audioWin.play();
      isGameOver = true;
    }
  }
}

// EVENTS

startBtn.addEventListener('click', () => {
  audioClick.play();
  levels.classList.toggle('hidden');
});

levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    audioClick.play();
  })
})