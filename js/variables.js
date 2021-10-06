'use strict';

// SELECTORS
const elForm = document.querySelector('.form');
const elBoard = document.querySelector('.board');
const elApp = document.querySelector('.app');
const elLives = document.querySelector('.lives');
const elTimerBox = document.querySelector('.timer-box');
const elRestartBtn = document.querySelector('.btn-restart');
const elSafeClickAmount = document.querySelector('.safe-btn-box span');
const elManuallyCreate = document.querySelector('.manually-create-box');
const elRecord = document.querySelector('.record');
const elHints = document.querySelector('.hints-box');
const elMinesNum = document.querySelector('.mines-num span');

//

const NUMS = {
	1: 'one',
	2: 'two',
	3: 'three',
	4: 'four',
	5: 'five',
	6: 'six',
	7: 'seven',
	8: 'eight',
};
const gLevels = {
	beginner: {
		size: 4,
		mines: 2,
	},
	medium: {
		size: 8,
		mines: 12,
	},
	expert: {
		size: 12,
		mines: 30,
	},
};
const gGameModes = {
	win: '😎',
	lose: `🤯`,
	start: '😃',
	minesSteps: {
		0: '😃',
		1: '🤒',
		2: '🤕',
	},
};
const MINE = '💣';
const FLAG = '🚩';

var gEmptyPlaces = [];
var unopenedLocations = [];
var gMinesLocations = [];

var gBoard;
var gNumMarked = 0;
var safeClickedCount;
//  INTERVALS
// Timer
var timerInterval;
// Hint
var hintInterval;

var gIsSevenBoom = false;
var gIsManually;
var gMinesRevealed;

var gHints;
var gMoves;
var gTurn;

var gLevel;
var gSize;
var gMines;
var gLives;
var gGame;
