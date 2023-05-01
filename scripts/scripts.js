"use strict";

const game = {
  title: "matching game",
  playerName: "",
  isRunning: true,
  wasRunning: false,
  currentScreen: "#splash-screen",
  preventClicks: false,
  numPairs: 2,
  numMatches: 0,
  numGuesses: 0,
  timer: false,
  loopDuration: 100,
  totalTime: 5000,
  timeRemaining: 5000,
  intervalID: "",
  possibleCards: [`<img src="images/cat1.jpg"/>`, `<img src="images/cat2.jpg"/>`, `<img src="images/cat3.jpg"/>`, `<img src="images/cat4.jpg"/>`, `<img src="images/cat5.jpg"/>`, `<img src="images/cat6.jpg"/>`, `<img src="images/cat7.jpg"/>`, `<img src="images/cat8.jpg"/>`, `<img src="images/cat9.jpg"/>`, `<img src="images/cat10.jpg"/>`, `<img src="images/cat11.jpg"/>`, `<img src="images/cat12.jpg"/>`],
  drawnCards: [],
  cardPairs: [],
  shuffledPairs: [],
  init: function () {
    game.switchScreen("#splash");
    game.timerToggle();
    $("#start-btn").on("click", () => {
      game.isrunning = true;
      game.switchScreen("#game");
      game.dealCards();
      game.startTimer();
      $("#username").html(`${game.playerName}`);
    });
    $(".quit-btn").on("click", () => {
      game.switchScreen("#splash");
      clearInterval(game.intervalId);
      game.resetTimer();
      game.isRunning = false;
    });
    $("#end-btn").on("click", () => {
      game.switchScreen("#game-over");
      game.gameOverMessage();
      clearInterval(game.intervalId);
      game.isRunning = false;
    });
    $("#play-again-btn").on("click", () => {
      game.isrunning = true;
      game.switchScreen("#game");
      game.dealCards();
      game.startTimer();
      game.resetTimer();
      $("#username").html(`${game.playerName}`);
    });
    $("#timer-switch").on("click", () => {
      game.timer = !game.timer;
      game.timerToggle();
    });

    $("#submit-btn").on("click", () => {
      game.updatePlayerName();
    });

    // grid selection buttons
    $("#btn-grid0").on("click", () => {
      game.numPairs = 2;
    });
    $("#btn-grid1").on("click", () => {
      game.numPairs = 4;
    });
    $("#btn-grid2").on("click", () => {
      game.numPairs = 6;
    });
    $("#btn-grid3").on("click", () => {
      game.numPairs = 8;
    });
    $("#btn-grid4").on("click", () => {
      game.numPairs = 10;
    });
    $("#btn-grid5").on("click", () => {
      game.numPairs = 12;
    });

    // timer selection buttons
    $("#btn-timer1").on("click", () => {
      game.totalTime = 5000;
      game.timeRemaining = game.totalTime;
    });
    $("#btn-timer2").on("click", () => {
      game.totalTime = 10000;
      game.timeRemaining = game.totalTime;
    });
    $("#btn-timer3").on("click", () => {
      game.totalTime = 15000;
      game.timeRemaining = game.totalTime;
    });
  },

  switchScreen: function (screenToShow) {
    game.currentScreen = screenToShow;
    $(".screen").hide();
    $(screenToShow).show();
  },

  timerToggle: function () {
    if (game.timer === false) {
      $("#timer-btns").children(".btn-check").attr("disabled", true);
    } else if (game.timer === true) {
      $("#timer-btns").children(".btn-check").removeAttr("disabled");
    }
  },

  dealCards: function (numPairs = game.numPairs) {
    game.resetGameBoard();
    game.resetCards();
    game.drawCards(numPairs);
    game.makePairs();
    game.shuffleCards();
    game.renderCards();
    game.activateCards();
    game.updateMatchDisplay();
    game.updateGuesseDisplay();
  },
  resetGameBoard: function () {
    $("#gameboard").html("");
    $("#gameboard").removeClass();
    game.numGuesses = 0;
    game.numMatches = 0;
  },
  resetCards: function () {
    game.drawnCards = [];
    game.cardPairs = [];
    game.shuffledPairs = [];
  },
  drawCards: function (numCards = 1) {
    if (numCards > game.possibleCards.length) {
      console.log("asking for more cards than exist");
      alert("asking for more cards than exist");
      return;
    }
    while (game.drawnCards.length < numCards) {
      const randomIndex = Math.floor(Math.random() * game.possibleCards.length);
      if (game.drawnCards.indexOf(game.possibleCards[randomIndex]) >= 0) {
        continue;
      } else {
        game.drawnCards.push(game.possibleCards[randomIndex]);
      }
    }
    console.log("unique individual, cards", game.drawnCards);
  },
  makePairs: function () {
    game.cardPairs = game.drawnCards.concat(game.drawnCards);
    console.log(game.cardPairs);
  },
  shuffleCards: function () {
    while (game.cardPairs.length > 0) {
      const randomIndex = Math.floor(Math.random() * game.cardPairs.length);
      const randomCard = game.cardPairs.splice(randomIndex, 1);
      game.shuffledPairs.push(randomCard[0]);
    }
    console.log(game.shuffledPairs);
  },
  renderCards: function () {
    for (const item of game.shuffledPairs) {
      console.log(item);
      const cardDomString = `<div class="card">
            <div class="card-face-up">${item}</div>
            <div class="card-face-down"><img src="images/cat-guy.svg" alt="cat logo" id="card-logo"></div>
        </div>`;
      $("#gameboard").append(cardDomString);
      switch (game.numPairs) {
        case 2:
          $("#gameboard").addClass("four");
          break;
        case 4:
          $("#gameboard").addClass("eight");
          break;
        case 6:
          $("#gameboard").addClass("twelve");
          break;
        case 8:
          $("#gameboard").addClass("sixteen");
          break;
        case 10:
          $("#gameboard").addClass("twenty");
          break;
        case 12:
          $("#gameboard").addClass("twenty-four");
          break;
      }
    }
  },
  activateCards: function () {
    $(".card").on("click", function (event) {
      if (!game.preventClicks) {
        if ($(event.currentTarget).hasClass("paired")) {
          return;
        } else {
          console.log(event.currentTarget);
          $(event.currentTarget).addClass("selected").children(".card-face-down").slideUp();
          if ($(".card.selected").length == 2) {
            clearInterval(game.intervalId);
            console.log("check for match");
            game.preventClicks = true;
            game.checkForMatch();
          }
        }
      }
    });
  },
  checkForMatch: function () {
    const card1 = $(".card.selected").eq(0).children(".card-face-up").html();
    console.log("card 1 contains", card1);
    const card2 = $(".card.selected").eq(1).children(".card-face-up").html();
    console.log("card 2 contains", card2);
    game.numGuesses = game.numGuesses + 1;
    game.updateGuesseDisplay();
    if (card1 === card2) {
      console.log("match");
      game.numMatches = game.numMatches + 1;
      game.updateMatchDisplay();
      $(".card.selected").addClass("paired");
      $(".card.selected").removeClass("selected");
      game.preventClicks = false;
      if (game.numMatches === game.numPairs) {
        game.gameOverMessage();
        game.switchScreen("#game-over");
      } else {
        game.resetTimer();
        game.startTimer();
      }
    } else {
      console.log("nope");
      setTimeout(game.deselectCards, 2000);
    }
  },
  deselectCards: function () {
    $(".card.selected").removeClass("selected").children(".card-face-down").slideDown();
    game.preventClicks = false;
    game.resetTimer();
    game.startTimer();
  },

  startTimer: function () {
    if (game.timer === true) {
      game.intervalId = setInterval(game.timerLoop, 100);
    } else {
      $("#secs").html("");
    }
  },

  timerLoop: function () {
    game.timeRemaining = game.timeRemaining - game.loopDuration;
    game.updateClockDisplay();
    if (game.timeRemaining < game.loopDuration) {
      game.gameOverMessage();
      game.switchScreen("#game-over");
      clearInterval(game.intervalId);
    }
  },

  resetTimer: function () {
    game.timeRemaining = game.totalTime;
  },

  updateClockDisplay: function () {
    if (game.timeRemaining < 10000) {
      $("#secs").html(`0${Math.ceil(game.timeRemaining / 1000)}`);
    } else {
      $("#secs").html(`${Math.ceil(game.timeRemaining / 1000)}`);
    }
  },

  updateGuesseDisplay: function () {
    $("#guesses").html(`${game.numGuesses}`);
  },

  updateMatchDisplay: function () {
    $("#matches").html(`${game.numMatches}`);
  },

  gameOverMessage: function () {
    if (game.timeRemaining == 0) {
      $("#game-over-username").html(`${game.playerName}`);
      $("#game-over-message").html("You ran out of time. Try again.");
      $("#cat-image").html(`<img src="images/cat-guy-sad.svg" />`);
    } else if (game.numMatches === game.numPairs) {
      $("#game-over-username").html(`${game.playerName}`);
      $("#game-over-message").html(`You got all ${game.numMatches} matches and guessed ${game.numGuesses} times. Congratulations!`);
      $("#cat-image").html(`<img src="images/cat-guy-happy.svg" />`);
    } else {
      $("#cat-image").html(`<img src="images/cat-guy.svg" />`);
    }
  },

  updatePlayerName: function () {
    game.playerName = $("#player-name-input").val();
    $("#player-name-div").hide();
    $("#player-name-input").val("");
    const usernameDomString = `<div id="name-display"><h2>Welcome ${game.playerName}</h2><button type="button" class="btn btn-secondary" id="reset-player">Reset Player</button></div>`;
    $("#username-display").append(usernameDomString);
    // event listener on reset button
    $("#reset-player").on("click", () => {
      $("#username-display").html("");
      $("#player-name-div").show();
      game.playerName = "";
    });
  },
};

game.init();
