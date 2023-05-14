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

levelHeading.textContent = 'Difficulty';
easyLevelBtn.textContent = 'Easy 10x10';
mediumLevelBtn.textContent = 'Medium 15x15';
hardLevelBtn.textContent = 'Hard 25x25';

// MAIN WINDOW

const field = createElement('div', '.main', 'game-field');
// for easy mode 10x10
let width = 10;
let bombAmount = 20;
let squares = [];

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


// EVENTS

startBtn.addEventListener('click', () => {
  levels.classList.toggle('hidden');
});