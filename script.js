/*jslint browser: true, indent: 3 */

document.addEventListener('DOMContentLoaded', function () {
   'use strict';
   let game;
   var chooseOpponentClaim, historyCanvas, historyContext, playerClaimCards, playerHandCards, opponentClaimCards, opponentHandCards, saveGame, startNewHand, updateGameboard;

   const localStorageKey = 'liarsCardGame';

   const getGameFromStorage = function () {
      try {
         return JSON.parse(localStorage.getItem(localStorageKey) || '');
      } catch (ex) {
         return {
            score: 0,
            scoreChange: 0,
            scoreHistory: [],
            lowestScore: 0,
            highestScore: 0,
            numCards: 4
         };
      }
   };
   game = getGameFromStorage();

   saveGame = function () {
      try {
         localStorage.setItem(localStorageKey, JSON.stringify(game));
         return true;
      } catch (ex) {
         return false;
      }
   };

   updateGameboard = function () {
      var whichCard, whichScore;
      document.querySelector('#score-section').classList.add('visible');
      if (game.score > 0) {
         document.querySelector('#score').innerHTML = '+' + game.score;
      } else if (game.score < 0) {
         document.querySelector('#score').innerHTML = '&minus;' + -game.score;
      } else {
         document.querySelector('#score').innerHTML = '0';
      }
      if (game.hasOwnProperty('playerCard')) {
         document.querySelector('#player-hand').classList.add('visible');
         document.querySelector('#player-claim').classList.add('visible');
      } else {
         document.querySelector('#player-hand').classList.remove('visible');
         document.querySelector('#player-claim').classList.remove('visible');
      }
      if (game.hasOwnProperty('opponentClaim')) {
         document.querySelector('#claim-instructions').innerHTML = 'You have claimed:';
         document.querySelector('#player-claim').classList.remove('selectable');
         document.querySelector('#opponent-claim').classList.add('visible');
         document.querySelector('#opponent-hand').classList.add('visible');
         if (game.playerClaim > game.opponentClaim) {
            document.querySelector('#opponent-hand').classList.remove('visible');
            document.querySelector('#result').innerHTML = 'Your claim is higher.&nbsp; You win your opponent&rsquo;s claim (+' + game.scoreChange + ').';
         } else if (game.playerClaim < game.opponentClaim) {
            document.querySelector('#opponent-hand').classList.remove('visible');
            document.querySelector('#result').innerHTML = 'Your opponent&rsquo;s claim is higher.&nbsp; You lose your claim (&minus;' + -game.scoreChange + ').';
         } else if (game.playerCard > game.opponentCard) {
            document.querySelector('#result').innerHTML = 'The claims are equal; your card is higher.&nbsp; You win your opponent&rsquo;s claim (+' + game.scoreChange + ').';
         } else if (game.playerCard < game.opponentCard) {
            document.querySelector('#result').innerHTML = 'The claims are equal; your opponent&rsquo;s card is higher.&nbsp; You lose your claim (&minus;' + -game.scoreChange + ').';
         } else {
            document.querySelector('#result').innerHTML = 'The claims are equal; the cards are equal (0).';
         }
         document.querySelector('#result-section').classList.add('visible');
      } else {
         document.querySelector('#claim-instructions').innerHTML = 'Choose card to claim you have:';
         document.querySelector('#player-claim').classList.add('selectable');
         document.querySelector('#opponent-claim').classList.remove('visible');
         document.querySelector('#opponent-hand').classList.remove('visible');
         document.querySelector('#result-section').classList.remove('visible');
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

   // "minimax" strategy found by hill-climbing
   chooseOpponentClaim = (card) => (
      card >= 3
      ? game.numCards - 1
      : Math.random() * 3 < 2
      ? 0
      : 1
   );

   // evolved defensive strategy
   chooseOpponentClaim = function (card) {
      var allInProbs, claim;
      allInProbs = [0.3, 0.1, 0.9, 1.0];
      claim = 0;
      if (card >= 0 && card < game.numCards) {
         while (claim < game.numCards - 1 && Math.random() < allInProbs[card]) {
            claim += 1;
         }
      }
      return claim;
   };

   (function () {
      var createPlayerClaimFunc, playerClaimFuncs, whichCard;

      createPlayerClaimFunc = function (card) {
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
      playerClaimFuncs = [];

      for (whichCard = 0; whichCard < game.numCards; whichCard += 1) {
         playerHandCards.push(document.querySelector('#player-hand-' + (whichCard + 1)));
         playerClaimCards.push(document.querySelector('#player-claim-' + (whichCard + 1)));
         opponentClaimCards.push(document.querySelector('#opponent-claim-' + (whichCard + 1)));
         opponentHandCards.push(document.querySelector('#opponent-hand-' + (whichCard + 1)));
      }
      playerClaimCards.forEach(function (element, whichCard) {
         playerClaimFuncs.push(createPlayerClaimFunc(whichCard));
         element.addEventListener('click', playerClaimFuncs[whichCard], false);
         element.addEventListener('mousedown', function (ev) {
            ev.preventDefault();
         }, false);
      });

      document.querySelector('#start-next-hand').addEventListener('click', startNewHand, false);

      document.addEventListener('keypress', function (ev) {
         var card, key, specialStrategies;
         key = (ev.key || String.fromCharCode(ev.charCode)).toLowerCase();
         specialStrategies = {
            a: [3, 3, 3, 3], // always aggressively all-in
            c: [0, 0, 0, 3], // conservative: bet only when can't lose
            h: [0, 1, 2, 3], // honest
            s: [1, 0, 0, 3], // best strategy against default AI ("sneaky")
            w: [3, 3, 2, 0], // worst strategy against default AI
            z: [0, 0, 3, 3]  // all-in when likely to win a showdown
         };
         if (specialStrategies[key]) {
            card = specialStrategies[key][game.playerCard];
         } else {
            card = key.charCodeAt(0) - '1'.charCodeAt(0);
         }
         if (key === '!') {
            localStorage.removeItem(localStorageKey);
            game = getGameFromStorage();
            startNewHand();
         } else if (game.hasOwnProperty('opponentClaim')) {
            startNewHand();
         } else if (card >= 0 && card < game.numCards) {
            playerClaimFuncs[card]();
         }
      }, false);

      historyCanvas = document.querySelector('#score-history');
      historyContext = historyCanvas && historyCanvas.getContext && historyCanvas.getContext('2d');

      if (!game.hasOwnProperty('playerCard')) { // if starting new history from scratch
         startNewHand();
      } else {
         updateGameboard();
      }
   }());
}, false);
