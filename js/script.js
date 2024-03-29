
// Select DOM elements
const elCells = document.querySelectorAll(".game-board-cell");
const form = document.querySelector("form");
const elSelectMarker = document.querySelector("#select-marker");
const elCurrentPlayer = document.querySelector("#current-player");
const elGameOutcome = document.querySelector("#game-outcome");
const elStartPlayer = document.querySelector("#start-player");
const btnReset = document.querySelector("#btn-reset");
const btnSelectMarker = document.querySelectorAll(".btn-marker");

const gameBoard = (() => {
    const Cell = (rowInitial, colInitial) => {
        let state = "";
        const row = rowInitial;
        const col = colInitial;

        const mark = (symbol) => {
            state = symbol;
        };

        const getState = () => state;

        return { row, col, mark, getState };
    };

    const grid = [
        [Cell(0, 0), Cell(0, 1), Cell(0, 2)],
        [Cell(1, 0), Cell(1, 1), Cell(1, 2)],
        [Cell(2, 0), Cell(2, 1), Cell(2, 2)],
    ];

    const render = () => {
        elCells.forEach((elCell) => {
            const row = elCell.getAttribute("data-row");
            const col = elCell.getAttribute("data-col");
            const cellContent = grid[row][col].getState();
            if (cellContent.toLowerCase() === "x") {
                elCell.textContent = "❌";
            } else if (cellContent.toLowerCase() === "o") {
                elCell.textContent = "⭕";
            } else {
                elCell.textContent = "";
            }
        });
    };

    // For debugging
    const show = () => {
        const gridCopy = grid.map((row) => row.map((cell) => cell.getState()));
        return gridCopy;
    };

    const reset = () => {
        grid.forEach((row) => {
            row.forEach((cell) => {
                cell.mark("");
            });
        });
        render();
    };

    return { render, show, reset, grid };
})();

const Player = (string) => {
    const name = string;
    let marker;
    return { name, marker };
};

const player1 = Player("Player 1");
const player2 = Player("Player 2");

const checkWinner = () => {
    function checkRow(mark, grid) {
        const winnerCheck = grid.some((row) =>
            row.every((cell) => cell.getState() === mark)
        );
        return winnerCheck;
    }

    function checkRowCol(mark) {
        // Check rows for winner, then transpose grid and check rows again.
        const gridTranspose = _.unzip(gameBoard.grid);
        return checkRow(mark, gameBoard.grid) || checkRow(mark, gridTranspose);
    }

    function checkDiagonal(mark) {
        const gridDiag1 = [
            gameBoard.grid[0][0],
            gameBoard.grid[1][1],
            gameBoard.grid[2][2],
        ];
        const gridDiag2 = [
            gameBoard.grid[0][2],
            gameBoard.grid[1][1],
            gameBoard.grid[2][0],
        ];
        const winnerCheck1 = gridDiag1.every(
            (cell) => cell.getState() === mark
        );
        const winnerCheck2 = gridDiag2.every(
            (cell) => cell.getState() === mark
        );
        return winnerCheck1 || winnerCheck2;
    }

    let winner = false;
    if (checkRowCol(player1.marker) || checkDiagonal(player1.marker)) {
        winner = player1;
    } else if (checkRowCol(player2.marker) || checkDiagonal(player2.marker)) {
        winner = player2;
    }
    return winner;
};

const game = (() => {
    // Init
    let gameTurn = 0;
    let currentPlayer = pickStartPlayer();
    let notStartPlayer = currentPlayer === player1 ? player2 : player1;

    function pickStartPlayer() {
        return Math.random() < 0.5 ? player1 : player2;
    }

    const gameState = (() => {
        let gameActive = false;
        const isActive = () => gameActive;
        const set = (bool) => {
            if (bool === true || bool === false) {
                gameActive = bool;
            }
        };
        return { isActive, set };
    })();

    function submitPlayerNames(e) {
        player1.name = e.target["name-player1"].value;
        if (!player1.name) {
            player1.name = "Player 1";
        }
        player2.name = e.target["name-player2"].value;
        if (!player2.name) {
            player2.name = "Player 2";
        }
        e.preventDefault();
        form.style.display = "none";
        elSelectMarker.style.display = "block";
        elStartPlayer.textContent = `The starting player is ${currentPlayer.name}`;
    }

    function start(e) {
        if (e.target.id === "btn-x") {
            currentPlayer.marker = "X";
            notStartPlayer.marker = "O";
        } else {
            currentPlayer.marker = "O";
            notStartPlayer.marker = "X";
        }
        elSelectMarker.style.display = "none";
        elCurrentPlayer.style.display = "block";
        elCurrentPlayer.textContent = `${currentPlayer.name}, it's your turn`;
        gameState.set(true);
    }

    const changeCurrentPlayer = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
        elCurrentPlayer.textContent = `${currentPlayer.name}, it's your turn`;
    };

    function checkGameOver() {
        if (gameTurn === 9) {
            gameTurn = 0;
            return true;
        }
        return false;
    }

    function reset() {
        gameBoard.reset();
        gameState.set(false);
        form.style.display = "block";
        form.reset();
        elSelectMarker.style.display = "none";
        elCurrentPlayer.style.display = "none";
        elGameOutcome.style.display = "none";
        player1.name = "Player 1";
        player2.name = "Player 2";
        gameTurn = 0;
        currentPlayer = pickStartPlayer();
        notStartPlayer = currentPlayer === player1 ? player2 : player1;
    }

    function takeTurn(e) {
        if (gameState.isActive() === false) {
            return;
        }
        const row = e.target.getAttribute("data-row");
        const col = e.target.getAttribute("data-col");
        if (gameBoard.grid[row][col].getState() !== "") {
            return;
        }
        gameBoard.grid[row][col].mark(currentPlayer.marker);
        gameTurn += 1;
        gameBoard.render();
        const winner = checkWinner();
        if (winner) {
            elCurrentPlayer.style.display = "none";
            elGameOutcome.style.display = "block";
            elGameOutcome.textContent = `${currentPlayer.name} is the winner!`;
            gameState.set(false);
        } else if (checkGameOver()) {
            elCurrentPlayer.style.display = "none";
            elGameOutcome.style.display = "block";
            elGameOutcome.textContent = `Tie game!`;
            gameState.set(false);
        }
        changeCurrentPlayer();
    }

    return { start, takeTurn, reset, submitPlayerNames };
})();

// Bind events
btnSelectMarker.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        game.start(e);
    });
});

elCells.forEach((elCell) => {
    elCell.addEventListener("click", (e) => {
        game.takeTurn(e);
    });
});

btnReset.addEventListener("click", () => {
    game.reset();
});

form.addEventListener("submit", (e) => {
    game.submitPlayerNames(e);
});
