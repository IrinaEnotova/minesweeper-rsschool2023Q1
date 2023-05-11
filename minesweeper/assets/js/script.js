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
    field.append(square);
    squares.push(square);
  }

}

createBoard();


// EVENTS

startBtn.addEventListener('click', () => {
  levels.classList.toggle('hidden');
});