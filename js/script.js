const elCells = document.querySelectorAll(".game-board-cell");



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

    const show = () => {
        const gridCopy = grid.map((row) => row.map((cell) => cell.getState()));
        return gridCopy;
    };

    const markCell = (row, col, symbol) => {
        grid[row][col].mark(symbol);
    };

    const reset = () => {
        grid.forEach((row) => {
            row.forEach((cell) => {
                cell.mark("");
            });
        });
        render();
    };

    return { render, show, reset, markCell, grid, };
})();

const Player = (string) => {
    const name = string;

    return { name };
};

const player1 = Player("John");
const player2 = Player("Dan");

const game = (() => {
    // Init
    const btnSelectMarker = document.querySelectorAll(".btn-marker");
    const form = document.querySelector("form");
    const elSelectMarker = document.querySelector("#select-marker");
    const elCurrentPlayer = document.querySelector("#current-player");
    const elGameOutcome = document.querySelector("#game-outcome");
    const elStartPlayer = document.querySelector("#start-player")

    let currentPlayer = Math.random() < 0.5 ? player1 : player2;
    const notStartPlayer = (currentPlayer === player1) ? player2 : player1;
    player1.marker = "X";
    player2.marker = "O";

    form.addEventListener("submit", (e) => {
        gameBoard.reset();
        player1.name = e.target["name-player1"].value;
        player2.name = e.target["name-player2"].value;
        e.preventDefault();
        form.style.display = "none";
        elSelectMarker.style.display = "block";
        elStartPlayer.textContent = `The starting player is ${currentPlayer.name}`
    });

    btnSelectMarker.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (e.target.id === "btn-x") {
                currentPlayer.marker = "X"
                notStartPlayer.marker = "O"
            } else {
                currentPlayer.marker = "O"
                notStartPlayer.marker = "X"
            }
            elSelectMarker.style.display = "none"
            elCurrentPlayer.style.display = "block"
        })
    })

    const changeCurrentPlayer = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    };

    const checkWinner = () => {
        function checkRow(mark, grid) {
            const winnerCheck = grid.some((row) =>
                row.every((cell) => cell.getState() === mark)
            );
            return winnerCheck;
        }

        function checkRowCol(mark) {
            const gridTranspose = _.unzip(gameBoard.grid);
            return (
                checkRow(mark, gameBoard.grid) || checkRow(mark, gridTranspose)
            );
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

        let winner = null;
        if (checkRowCol(player1.marker) || checkDiagonal(player1.marker)) {
            winner = player1;
        } else if (
            checkRowCol(player2.marker) ||
            checkDiagonal(player2.marker)
        ) {
            winner = player2;
        }
        return winner;
    };

    let gameTurn = 0;
    
    function checkGameOver() {
        
        if (gameTurn === 9) {
            gameTurn = 0;
            return true;
        } 
        
        return false
    }

    
    elCells.forEach((elCell) => {
        elCell.addEventListener("click", (e) => {
            const row = e.target.getAttribute("data-row");
            const col = e.target.getAttribute("data-col");
            if (gameBoard.grid[row][col].getState() !== "") {
                return;
            }
            gameBoard.grid[row][col].mark(currentPlayer.marker);
            gameTurn += 1;
            gameBoard.render();
            changeCurrentPlayer();
            checkWinner();
            checkGameOver();
        });
    });

    return { changeCurrentPlayer };
})();
