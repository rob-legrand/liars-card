/*jslint browser: true, indent: 3 */

document.addEventListener('DOMContentLoaded', function () {
   'use strict';
   var chooseOpponentClaim, game, historyCanvas, historyContext, makePlayerClaim, playerClaimCards, playerHandCards, opponentClaimCards, opponentHandCards, saveGame, startNewHand, updateGameboard;

   if (!localStorage) {
      window.alert('Your browser does not seem to support localStorage correctly.\nWe recommend a recent version of a standards-compliant browser such as Opera, Chrome or Firefox.');
   }

   game = {
      score: 0,
      scoreChange: 0,
      scoreHistory: [],
      lowestScore: 0,
      highestScore: 0,
      numCards: 4
   };

   saveGame = function () {
      if (!localStorage) {
         return false;
      }
      localStorage.liarsCardGame = JSON.stringify(game);
      return true;
   };

   updateGameboard = function () {
      var whichCard, whichScore;
      document.getElementById('score-section').classList.add('visible');
      if (game.score > 0) {
         document.getElementById('score').innerHTML = '+' + game.score;
      } else if (game.score < 0) {
         document.getElementById('score').innerHTML = '&minus;' + -game.score;
      } else {
         document.getElementById('score').innerHTML = '0';
      }
      if (game.hasOwnProperty('playerCard')) {
         document.getElementById('player-hand').classList.add('visible');
         document.getElementById('player-claim').classList.add('visible');
      } else {
         document.getElementById('player-hand').classList.remove('visible');
         document.getElementById('player-claim').classList.remove('visible');
      }
      if (game.hasOwnProperty('opponentClaim')) {
         document.getElementById('claim-instructions').innerHTML = 'You have claimed:';
         document.getElementById('player-claim').classList.remove('selectable');
         document.getElementById('opponent-claim').classList.add('visible');
         document.getElementById('opponent-hand').classList.add('visible');
         if (game.playerClaim > game.opponentClaim) {
            document.getElementById('opponent-hand').classList.remove('visible');
            document.getElementById('result').innerHTML = 'Your claim is higher.&nbsp; You win your opponent&rsquo;s claim (+' + game.scoreChange + ').';
         } else if (game.playerClaim < game.opponentClaim) {
            document.getElementById('opponent-hand').classList.remove('visible');
            document.getElementById('result').innerHTML = 'Your opponent&rsquo;s claim is higher.&nbsp; You lose your claim (&minus;' + -game.scoreChange + ').';
         } else if (game.playerCard > game.opponentCard) {
            document.getElementById('result').innerHTML = 'The claims are equal; your card is higher.&nbsp; You win your opponent&rsquo;s claim (+' + game.scoreChange + ').';
         } else if (game.playerCard < game.opponentCard) {
            document.getElementById('result').innerHTML = 'The claims are equal; your opponent&rsquo;s card is higher.&nbsp; You lose your claim (&minus;' + -game.scoreChange + ').';
         } else {
            document.getElementById('result').innerHTML = 'The claims are equal; the cards are equal (0).';
         }
         document.getElementById('result-section').classList.add('visible');
      } else {
         document.getElementById('claim-instructions').innerHTML = 'Choose card to claim you have:';
         document.getElementById('player-claim').classList.add('selectable');
         document.getElementById('opponent-claim').classList.remove('visible');
         document.getElementById('opponent-hand').classList.remove('visible');
         document.getElementById('result-section').classList.remove('visible');
      }
      for (whichCard = 0; whichCard < game.numCards; whichCard += 1) {
         if (whichCard === game.playerCard) {
            playerHandCards[whichCard].classList.remove('hidden');
         } else {
            playerHandCards[whichCard].classList.add('hidden');
         }
         if (whichCard === game.playerClaim) {
            playerClaimCards[whichCard].classList.add('selected');
         } else {
            playerClaimCards[whichCard].classList.remove('selected');
         }
         if (whichCard === game.opponentClaim) {
            opponentClaimCards[whichCard].classList.add('selected');
         } else {
            opponentClaimCards[whichCard].classList.remove('selected');
         }
         if (whichCard === game.opponentCard) {
            opponentHandCards[whichCard].classList.remove('hidden');
         } else {
            opponentHandCards[whichCard].classList.add('hidden');
         }
      }
      if (historyContext) {
         historyCanvas.width = game.scoreHistory.length;
         historyCanvas.height = game.highestScore - game.lowestScore + 1;
         historyContext.fillStyle = '#ffffff';
         historyContext.fillRect(0, 0, historyCanvas.width, historyCanvas.height);
         historyContext.fillStyle = '#cccccc';
         historyContext.fillRect(0, game.highestScore, historyCanvas.width, 1);
         historyContext.fillStyle = '#000000';
         for (whichScore = 0; whichScore < game.scoreHistory.length; whichScore += 1) {
            historyContext.fillRect(whichScore, game.highestScore - game.scoreHistory[whichScore], 1, 1);
         }
      }
      saveGame();
   };

   startNewHand = function () {
      game.score += game.scoreChange;
      game.scoreHistory.push(game.score);
      if (game.score < game.lowestScore) {
         game.lowestScore = game.score;
      }
      if (game.score > game.highestScore) {
         game.highestScore = game.score;
      }
      game.playerCard = Math.floor(Math.random() * game.numCards);
      delete game.playerClaim;
      delete game.opponentClaim;
      game.opponentCard = Math.floor(Math.random() * game.numCards);
      updateGameboard();
   };

   chooseOpponentClaim = function (card) {
      var allInProbs, claim;
      allInProbs = [0.3, 0.1, 0.9, 1.0];
      claim = 0;
      while (claim < game.numCards - 1 && Math.random() < allInProbs[card]) {
         claim += 1;
      }
      return claim;
   };

   makePlayerClaim = function (card) {
      return function () {
         if (game.hasOwnProperty('playerCard') && !game.hasOwnProperty('playerClaim')) {
            game.playerClaim = card;
            game.opponentClaim = chooseOpponentClaim(game.opponentCard);
            if (game.playerClaim > game.opponentClaim) {
               game.scoreChange = game.opponentClaim + 1;
            } else if (game.playerClaim < game.opponentClaim) {
               game.scoreChange = -game.playerClaim - 1;
            } else if (game.playerCard > game.opponentCard) {
               game.scoreChange = game.opponentClaim + 1;
            } else if (game.playerCard < game.opponentCard) {
               game.scoreChange = -game.playerClaim - 1;
            } else {
               game.scoreChange = 0;
            }
            updateGameboard();
         }
      };
   };

   playerHandCards = [];
   playerClaimCards = [];
   opponentClaimCards = [];
   opponentHandCards = [];

   (function () {
      var whichCard;
      for (whichCard = 0; whichCard < game.numCards; whichCard += 1) {
         playerHandCards[whichCard] = document.getElementById('player-hand-' + (whichCard + 1));
         playerClaimCards[whichCard] = document.getElementById('player-claim-' + (whichCard + 1));
         playerClaimCards[whichCard].addEventListener('click', makePlayerClaim(whichCard));
         opponentClaimCards[whichCard] = document.getElementById('opponent-claim-' + (whichCard + 1));
         opponentHandCards[whichCard] = document.getElementById('opponent-hand-' + (whichCard + 1));
      }
   }());

   document.getElementById('start-next-hand').addEventListener('click', startNewHand);

   historyCanvas = document.getElementById('history');
   historyContext = historyCanvas && historyCanvas.getContext && historyCanvas.getContext('2d');

   if (localStorage && localStorage.liarsCardGame) {
      game = JSON.parse(localStorage.liarsCardGame);
      updateGameboard();
   }
   if (!game.hasOwnProperty('playerCard')) { // if starting new history from scratch
      startNewHand();
   }
});
