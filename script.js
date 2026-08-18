/*jslint browser: true, indent: 3 */

document.addEventListener('DOMContentLoaded', function () {
   'use strict';
   var chooseOpponentClaim, game, historyCanvas, historyContext, playerClaimCards, playerHandCards, opponentClaimCards, opponentHandCards, saveGame, startNewHand, updateGameboard;

   saveGame = function () {
      try {
         localStorage.setItem('liarsCardGame', JSON.stringify(game));
         return true;
      } catch (ex) {
         return false;
      }
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
      if (card >= 0 && card < game.numCards) {
         while (claim < game.numCards - 1 && Math.random() < allInProbs[card]) {
            claim += 1;
         }
      }
      return claim;
   };

   (function () {
      var createPlayerClaimFunc, getGameFromStorage, playerClaimFuncs, whichCard;

      getGameFromStorage = function () {
         try {
            return JSON.parse(localStorage.getItem('liarsCardGame') || '');
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
         playerHandCards.push(document.getElementById('player-hand-' + (whichCard + 1)));
         playerClaimCards.push(document.getElementById('player-claim-' + (whichCard + 1)));
         opponentClaimCards.push(document.getElementById('opponent-claim-' + (whichCard + 1)));
         opponentHandCards.push(document.getElementById('opponent-hand-' + (whichCard + 1)));
      }
      playerClaimCards.forEach(function (element, whichCard) {
         playerClaimFuncs.push(createPlayerClaimFunc(whichCard));
         element.addEventListener('click', playerClaimFuncs[whichCard], false);
         element.addEventListener('mousedown', function (ev) {
            ev.preventDefault();
         }, false);
      });

      document.getElementById('start-next-hand').addEventListener('click', startNewHand, false);

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
            localStorage.removeItem('liarsCardGame');
            game = getGameFromStorage();
            startNewHand();
         } else if (game.hasOwnProperty('opponentClaim')) {
            startNewHand();
         } else if (card >= 0 && card < game.numCards) {
            playerClaimFuncs[card]();
         }
      }, false);

      historyCanvas = document.getElementById('score-history');
      historyContext = historyCanvas && historyCanvas.getContext && historyCanvas.getContext('2d');

      if (!game.hasOwnProperty('playerCard')) { // if starting new history from scratch
         startNewHand();
      } else {
         updateGameboard();
      }
   }());
}, false);
