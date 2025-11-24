// ---------- Tab Switching ----------
const tabButtons = document.querySelectorAll(".game-tabs button");
const sections = document.querySelectorAll(".game-section");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-game");

    // active button
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // active section
    sections.forEach(sec => {
      sec.classList.toggle("active", sec.id === targetId);
    });
  });
});

// ---------- Tic-Tac-Toe ----------
const tttCells = document.querySelectorAll(".ttt-cell");
const tttStatus = document.getElementById("ttt-status");
const tttResetBtn = document.getElementById("ttt-reset");

let tttBoard = Array(9).fill("");
let currentPlayer = "X";
let tttGameOver = false;

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

function handleTttClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute("data-index"));

  if (tttBoard[index] !== "" || tttGameOver) return;

  tttBoard[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.classList.add("taken");

  if (checkWinner(currentPlayer)) {
    tttStatus.textContent = `Player ${currentPlayer} wins!`;
    tttGameOver = true;
    return;
  }

  if (tttBoard.every(v => v !== "")) {
    tttStatus.textContent = "It's a draw!";
    tttGameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  tttStatus.textContent = `Current player: ${currentPlayer}`;
}

function checkWinner(player) {
  return winPatterns.some(pattern =>
    pattern.every(index => tttBoard[index] === player)
  );
}

function resetTtt() {
  tttBoard = Array(9).fill("");
  currentPlayer = "X";
  tttGameOver = false;
  tttStatus.textContent = "Current player: X";
  tttCells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("taken");
  });
}

tttCells.forEach(cell => cell.addEventListener("click", handleTttClick));
tttResetBtn.addEventListener("click", resetTtt);

// ---------- Reaction Time ----------
const reactionBox = document.getElementById("reaction-box");
const reactionResult = document.getElementById("reaction-result");
const reactionStartBtn = document.getElementById("reaction-start");

let reactionTimeout = null;
let reactionStartTime = null;
let waitingForGreen = false;
let canClick = false;

function startReaction() {
  reactionResult.textContent = "";
  reactionBox.style.background = "#334155";
  reactionBox.textContent = "Wait for green...";
  waitingForGreen = true;
  canClick = false;

  const delay = 1000 + Math.random() * 4000; // 1–5 sec
  clearTimeout(reactionTimeout);
  reactionTimeout = setTimeout(() => {
    reactionBox.style.background = "#22c55e";
    reactionBox.textContent = "CLICK!";
    reactionStartTime = performance.now();
    waitingForGreen = false;
    canClick = true;
  }, delay);
}

reactionBox.addEventListener("click", () => {
  if (waitingForGreen) {
    // clicked too early
    clearTimeout(reactionTimeout);
    reactionBox.style.background = "#ef4444";
    reactionBox.textContent = "Too early!";
    reactionResult.textContent = "You clicked before it turned green.";
    waitingForGreen = false;
    canClick = false;
  } else if (canClick) {
    const end = performance.now();
    const diff = end - reactionStartTime;
    reactionBox.style.background = "#0ea5e9";
    reactionBox.textContent = "Nice!";
    reactionResult.textContent = `Your reaction time: ${diff.toFixed(0)} ms`;
    canClick = false;
  }
});

reactionStartBtn.addEventListener("click", startReaction);

// ---------- Memory Game ----------
const memoryGrid = document.getElementById("memory-grid");
const memoryStatus = document.getElementById("memory-status");
const memoryResetBtn = document.getElementById("memory-reset");

const memoryIcons = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝", "🍒", "🍉"];
let memoryCards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;

function setupMemoryGame() {
  memoryGrid.innerHTML = "";
  memoryStatus.textContent = "";
  matchesFound = 0;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  const pairIcons = [...memoryIcons, ...memoryIcons];
  // shuffle
  pairIcons.sort(() => Math.random() - 0.5);

  pairIcons.forEach(icon => {
    const div = document.createElement("div");
    div.classList.add("memory-card");
    div.dataset.icon = icon;
    div.textContent = ""; // hidden initially
    div.addEventListener("click", onMemoryCardClick);
    memoryGrid.appendChild(div);
  });

  memoryCards = document.querySelectorAll(".memory-card");
}

function onMemoryCardClick(e) {
  const card = e.currentTarget;
  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");
  card.textContent = card.dataset.icon;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  checkMemoryMatch();
}

function checkMemoryMatch() {
  const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchesFound++;
    resetMemoryTurn();

    if (matchesFound === memoryIcons.length) {
      memoryStatus.textContent = "You found all pairs! 🎉";
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard.textContent = "";
      secondCard.textContent = "";
      resetMemoryTurn();
    }, 800);
  }
}

function resetMemoryTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

memoryResetBtn.addEventListener("click", setupMemoryGame);
setupMemoryGame();

// ---------- Rock Paper Scissors ----------
const rpsButtons = document.querySelectorAll(".rps-btn");
const rpsResult = document.getElementById("rps-result");
const rpsScore = document.getElementById("rps-score");

let playerScore = 0;
let computerScore = 0;

function computerMove() {
  const moves = ["rock", "paper", "scissors"];
  return moves[Math.floor(Math.random() * moves.length)];
}

function decideWinner(player, computer) {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "player";
  }
  return "computer";
}

function handleRpsClick(e) {
  const playerChoice = e.currentTarget.dataset.move;
  const compChoice = computerMove();
  const winner = decideWinner(playerChoice, compChoice);

  if (winner === "draw") {
    rpsResult.textContent = `You chose ${playerChoice}, computer chose ${compChoice}. It's a draw.`;
  } else if (winner === "player") {
    playerScore++;
    rpsResult.textContent = `You chose ${playerChoice}, computer chose ${compChoice}. You win! 🎉`;
  } else {
    computerScore++;
    rpsResult.textContent = `You chose ${playerChoice}, computer chose ${compChoice}. You lose. 😅`;
  }

  rpsScore.textContent = `Player: ${playerScore} | Computer: ${computerScore}`;
}

rpsButtons.forEach(btn => btn.addEventListener("click", handleRpsClick));
