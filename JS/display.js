'use strict';

// BOARD
function renderBoard() {
	elBoard.innerHTML = '';
	var strHtml = '';
	for (var i = 0; i < gSize; i++) {
		strHtml += '<tr>';
		for (var j = 0; j < gSize; j++) {
			var curCell = gBoard[i][j].isMine ? MINE : gBoard[i][j].minesAroundCount;
			var className = !curCell || curCell === MINE ? '' : NUMS[curCell];
			strHtml += `<td id="cell-${i}-${j}" class="${className}" onclick="cellClicked(this) " oncontextmenu="addMarked(this,event)">
			</td>`;
		}
		strHtml += '</tr>';
	}
	elBoard.innerHTML = strHtml;
	elApp.classList.remove('hidden');
}

// TIMER
function renderTimer(start) {
	function time() {
		var sec = Math.floor((+new Date() - start) / 1000);
		// var min = ('' + Math.floor(sec / 60)).padStart(2, 0);
		// elTimerBox.innerText = `${min}:${('' + (sec % 60)).padStart(2, 0)}`;
		elTimerBox.innerText = `${('' + (sec % 60)).padStart(4, 0)}`;
		gGame.secsPassed++;
	}
	timerInterval = setInterval(time, 1000);
}
// START
function renderStartDisplay() {
	renderRecords();

	elHints.innerText = `${gHints.hints.join(' ')}`;
	elLives.innerText = `${gLives.join(' ')}`;
	elRestartBtn.innerText = gGameModes.start;

	elManuallyCreate.classList.add('hidden');
	elApp.classList.add('hidden');
	elForm.classList.remove('hidden');

	// Resetting the timer
	elTimerBox.innerText = `0000`;
	clearInterval(timerInterval);
}
function renderRecords() {
	const records = getLocalRecords();
	for (const key in records) renderRecord(records[key], key);
}
function renderRecord(record, level) {
	var elRecord = document.querySelector(`.record-${level} span`);
	elRecord.innerText = record;
}

function renderMinesNum(num) {
	elMinesNum.innerText = `${+elMinesNum.innerText + num}`.padStart(2, 0);
}
function renderCell(coord, cell, isUndo = true) {
	var elCell = document.querySelector(getSelector(coord));
	if (isUndo) elCell.classList.remove('open', 'mine');
	else elCell.classList.add(`${cell.isMine ? 'mine' : 'open'}`);
	var text = isUndo ? '' : cell.isMine ? MINE : cell.minesAroundCount || '';
	elCell.innerText = text;
}
function renderRestartBtn() {
	gMinesRevealed = document.querySelectorAll('.mine').length;
	elRestartBtn.innerText = `${gGameModes.minesSteps[gMinesRevealed]}`;
}
