'use strict';
// localStorage.clear();

// BUTTON CLICKS
function cellClicked(elCell) {
	var curCoord = getCellCoord(elCell.id);
	var curCell = gBoard[curCoord.i][curCoord.j];

	// Manually create
	if (curCell.isShown && !isMinesAroundCorrect(curCell, curCoord.i, curCoord.j))
		return;
	if (gIsManually) {
		manuallyCreate(elCell, curCell, curCoord);
		return;
	}
	if ((!gGame.isOn && gGame.shownCount) || curCell.isMarked || gHints.isLive)
		return;

	gTurn++;
	if (curCell.isShown && !gHints.isOn) {
		showNei(curCell, curCoord.i, curCoord.j);
		return;
	}
	// HINT mode
	if (gHints.isOn) {
		hint(curCoord);
		return;
	}
	// TO START the game
	if (!gGame.isOn) startGame(curCoord, gMinesLocations.length === 0);

	// If there is a MINE in the chosen cell
	if (curCell.isMine) {
		stepOnMine(curCell, curCoord);
		return;
	}
	openCells(curCoord.i, curCoord.j);
}
// HINT CLICK function
function hintClicked() {
	// Check if there is any hints left or if the game already started
	if (!gHints.hints.length || !gGame.isOn) return;
	// Removing the hint
	gHints.hints.pop();
	// Updating the DOM
	elHints.innerText = `${gHints.hints.join(' ')}`;
	gHints.isOn = true;
}
// SAFE CLICK function
function safeClickClicked() {
	if (!safeClickedCount || !gGame.isOn) return;
	elSafeClickAmount.innerText = `${--safeClickedCount} remain`;
	if (!safeClickedCount) elSafeClickAmount.style.color = `#d00000`;

	var idx = randomInt(unopenedLocations.length - 1, 0);
	var el = document.querySelector(`${getSelector(unopenedLocations[idx])}`);
	// SHOWING THE SAFE PLACE
	el.classList.add('safe-click');
	setTimeout(() => el.classList.remove('safe-click'), 1000);
}
// UNDO
function undo(isHint = false) {
	if (!gGame.isOn || !gTurn) return;

	var prevMoves = gMoves[gTurn];
	for (var idx = 0; idx < prevMoves.length; idx++) {
		var { i, j } = prevMoves[idx];

		renderCell({ i, j }, gBoard[i][j]);

		gBoard[i][j].isShown = false;
		renderRestartBtn();

		gGame.shownCount--;
		// MINE in the prev location
		if (gBoard[i][j].isMine) {
			renderMinesNum(1);
			if (isHint) continue;
			gLives.push('❤️');
			elLives.innerText = gLives.join(' ');
		}
	}
	// Delete the property
	delete gMoves[gTurn];
	//
	gTurn--;
}
// 7 BOOM!
function sevenBoom() {
	gIsSevenBoom = true;
	init();
}
// MANUALLY CREATE function
function manuallyClicked() {
	gIsManually = true;
	elManuallyCreate.querySelector('span').innerText = `${
		gMines - gMinesLocations.length
	} mines remain`;
}
// RIGHT CLICK
function addMarked(elCell, e) {
	e.preventDefault();

	var coord = getCellCoord(elCell.id);
	var cell = gBoard[coord.i][coord.j];
	if (!gGame.isOn || cell.isShown) return;
	if (gGame.markedCount >= gMines && !cell.isMarked) {
		return;
	}
	cell.isMarked = cell.isMarked ? false : true;
	gGame.markedCount += cell.isMarked ? 1 : -1;
	if (cell.isMine) gNumMarked += cell.isMarked ? 1 : -1;

	elCell.innerText = cell.isMarked ? FLAG : '';

	renderMinesNum(cell.isMarked ? -1 : 1);

	// Wining
	if (
		(gNumMarked === gMines || gNumMarked + gMinesRevealed === gMines) &&
		gGame.shownCount === gSize ** 2 - gMines
	)
		gameOver(true);
}
////////////////////////////////
// OPEN
// OPEN CELLS
function openCells(i, j) {
	// Check
	if (isNotLegal(i, j)) return;
	// SHOW the current cell
	showACell(gBoard[i][j], { i, j });
	// if its not an empty cell
	if (gBoard[i][j].minesAroundCount) return;

	openCells(i - 1, j) ||
		openCells(i, j - 1) ||
		openCells(i + 1, j) ||
		openCells(i, j + 1) ||
		openCells(i + 1, j + 1) ||
		openCells(i - 1, j + 1) ||
		openCells(i - 1, j - 1) ||
		openCells(i + 1, j - 1);
}
// START
function startGame(coord, isRegularStart) {
	if (isRegularStart) {
		// Removing the first cell from the empty array
		removeFromTheArray(coord, gEmptyPlaces);
		// creating an array that holds the bombs coords

		addMines(gIsSevenBoom);
		// updating the unopened array
		unopenedLocations = gEmptyPlaces.slice();
		gMines = gMinesLocations.length;
		elMinesNum.innerText = `${gMines}`.padStart(2, 0);
	}

	createBoard();
	renderBoard();
	gGame.isOn = true;
	// Removing the option of manually create
	elManuallyCreate.classList.add('hidden');

	// Start the timer
	renderTimer(new Date());
}
// GAME OVER
function gameOver(win = false) {
	clearInterval(timerInterval);
	gGame.isOn = false;
	elRestartBtn.innerText = win ? gGameModes.win : gGameModes.lose;
	if (win) {
		saveLocalScore(gGame.secsPassed, gLevel);
	}
	elRestartBtn.classList.add('end');
	elRestartBtn.addEventListener('animationend', () =>
		elRestartBtn.classList.remove('end')
	);
}
// MINES FUNCTIONS
function addMines(isSevenBoom = false) {
	const minesLocations = [];
	var copyEmpty = gEmptyPlaces.slice();
	var len = isSevenBoom ? copyEmpty.length : gMines;

	for (var idx = 0; idx < len; idx++) {
		var curIdx;
		if (isSevenBoom) {
			var i = copyEmpty[idx].i;
			var j = copyEmpty[idx].j;
			if (
				(i - 1) % 7 !== 0 &&
				(j - 1) % 7 !== 0 &&
				!('' + i + '' + j).includes('7')
			) {
				continue;
			}
			curIdx = idx;
			addMine({ i, j }, true);
		} else {
			curIdx = randomInt(gEmptyPlaces.length - 1, 0);
			addMine(gEmptyPlaces[curIdx]);
			gEmptyPlaces.splice(curIdx, 1);
		}
	}
	gIsSevenBoom = false;
	return minesLocations;
}
// ADD MINE
function addMine(coord, toRemove = false) {
	gMinesLocations.push(coord);
	//Updating
	gBoard[coord.i][coord.j].isMine = true;
	// Removing from the array
	toRemove && removeFromTheArray(coord, gEmptyPlaces);

	if (gMinesLocations.length === gMines && gIsManually) {
		gIsManually = false;
		unopenedLocations = gEmptyPlaces.slice();

		// Removing the mark class
		var elMine = document.querySelectorAll('.mine');
		// Removing classes
		for (var i = 0; i < elMine.length; i++) elMine[i].classList.remove('mine');
	}
}
function stepOnMine(cell, coords) {
	if (cell.isShown) return;
	// Removing one life
	gLives.pop();
	elLives.innerText = `${gLives.join(' ')}`;
	// SHOWING the cell
	showACell(cell, coords);

	if (!gLives.length) {
		gameOver();
		return;
	}
	renderRestartBtn();
	if (
		gNumMarked + gMinesRevealed === gMines &&
		gNumMarked !== 0 &&
		gGame.shownCount === gSize ** 2 - gMines
	)
		gameOver(true);
}
////////////////////////////////////////////////////////////////////////////////////////
function showACell(cell, coord) {
	if (cell.isShown || cell.isMarked) return;
	renderCell(coord, cell, false);

	// Updating the current cell isShown to true
	cell.isShown = true;
	// Updating the amount of cells that shown
	gGame.shownCount++;
	//Remove
	removeFromTheArray(coord, unopenedLocations);

	cell.isMine && renderMinesNum(-1);
	// Update moves
	updateMoves(coord);

	if (
		gNumMarked + gMinesRevealed === gMines &&
		gNumMarked !== 0 &&
		gGame.shownCount === gSize ** 2 - gMines
	)
		gameOver(true);
}
// REMOVE an item from an array by
function removeFromTheArray(coord, arr) {
	for (var idx = 0; idx < arr.length; idx++) {
		var curCell = arr[idx];
		if (curCell.i !== coord.i || coord.j !== curCell.j) continue;
		return arr.splice(idx, 1);
	}
}
function isNotLegal(i, j) {
	return (
		i < 0 ||
		j < 0 ||
		i >= gBoard.length ||
		j >= gBoard[0].length ||
		gBoard[i][j].isMine ||
		gBoard[i][j].isShown ||
		gBoard[i][j].isMarked
	);
}
function updateMoves(coord) {
	if (!gMoves[gTurn]) gMoves[gTurn] = [];
	gMoves[gTurn].push(coord);
}
function manuallyCreate(elCell, curCell, coord) {
	// Check if there is already a mine in this cell
	if (curCell.isMine) return;

	elCell.classList.add('mine');
	// Add a mines
	addMine(coord, true);
	// Updating the number of mines remain to place
	var minesRemain = gMines - gMinesLocations.length;

	elManuallyCreate.querySelector('span').innerText = `${
		minesRemain ? `${minesRemain} mines remain` : 'Touch a cell to start'
	}`;
}
function hint(coord) {
	numOfNeighbor(gBoard, coord.i, coord.j, true);
	gHints.isOn = false;
	gHints.isLive = true;

	setTimeout(() => {
		gHints.isLive = false;
		undo(true);
	}, 1000);
}
function showNei(cell, row, col) {
	for (var i = row - 1; i <= row + 1 && i < gBoard.length; i++) {
		if (i < 0) continue;
		for (var j = col - 1; j <= col + 1 && j < gBoard[i].length; j++) {
			if ((i === row && j === col) || j < 0) continue;

			if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
				stepOnMine(gBoard[i][j], { i, j });
				continue;
			}

			if (!gBoard[i][j].minesAroundCount) {
				openCells(i, j);
				continue;
			}

			showACell(gBoard[i][j], { i, j });
		}
	}
}
function isMinesAroundCorrect(cell, row, col) {
	var num = 0;
	for (var i = row - 1; i <= row + 1 && i < gBoard.length; i++) {
		if (i < 0) continue;
		for (var j = col - 1; j <= col + 1 && j < gBoard[i].length; j++) {
			if ((i === row && j === col) || j < 0) continue;
			((gBoard[i][j].isMine && gBoard[i][j].isShown) ||
				gBoard[i][j].isMarked) &&
				num++;
		}
	}
	return num === cell.minesAroundCount;
}
