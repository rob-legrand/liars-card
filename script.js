/*jslint browser: true, indent: 3 */

document.addEventListener('DOMContentLoaded', function () {
   'use strict';
   let game;
   var saveGame, updateGameboard;

   const historyCanvas = document.querySelector('#score-history');
   const historyContext = historyCanvas?.getContext?.('2d');
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

   const playerHandCards = Array.from(
      {length: game.numCards},
      (ignore, whichCard) => document.querySelector(
         '#player-hand-' + (whichCard + 1)
      )
   );
   const playerClaimCards = playerHandCards.map(
      (ignore, whichCard) => document.querySelector(
         '#player-claim-' + (whichCard + 1)
      )
   );
   const opponentClaimCards = playerHandCards.map(
      (ignore, whichCard) => document.querySelector(
         '#opponent-claim-' + (whichCard + 1)
      )
   );
   const opponentHandCards = playerHandCards.map(
      (ignore, whichCard) => document.querySelector(
         '#opponent-hand-' + (whichCard + 1)
      )
   );

   // evolved defensive strategy
   const chooseOpponentClaim = function (card) {
      let claim;
      const allInProbs = [0.3, 0.1, 0.9, 1.0];
      claim = 0;
      if (card >= 0 && card < game.numCards) {
         while (claim < game.numCards - 1 && Math.random() < allInProbs[card]) {
            claim += 1;
         }
      }
      return claim;
   };

   // "minimax" strategy found by hill-climbing
// const chooseOpponentClaim = (card) => (
//    card >= 2
//    ? game.numCards - 1
//    : Math.random() * 3 < 2
//    ? 0
//    : 1
// );

   const playerClaimFuncs = playerHandCards.map(
      (ignore, whichCard) => function () {
         if (Object.hasOwn(game, 'playerCard') && !Object.hasOwn(game, 'playerClaim')) {
            game.playerClaim = whichCard;
            game.opponentClaim = chooseOpponentClaim(game.opponentCard);
            game.scoreChange = (
               game.playerClaim > game.opponentClaim
               ? game.opponentClaim + 1
               : game.playerClaim < game.opponentClaim
               ? -game.playerClaim - 1
               : game.playerCard > game.opponentCard
               ? game.opponentClaim + 1
               : game.playerCard < game.opponentCard
               ? -game.playerClaim - 1
               : 0
            );
            updateGameboard();
         }
      }
   );

   saveGame = function () {
      try {
         localStorage.setItem(localStorageKey, JSON.stringify(game));
         return true;
      } catch (ex) {
         return false;
      }
   };

   updateGameboard = function () {
      document.querySelector('#score-section').classList.add('visible');
      document.querySelector('#score').textContent = (
         game.score > 0
         ? '+' + game.score
         : game.score < 0
         ? '\u{2212}' + -game.score
         : '0'
      );
      document.querySelector('#player-hand').classList.toggle('visible', Object.hasOwn(game, 'playerCard'));
      document.querySelector('#player-claim').classList.toggle('visible', Object.hasOwn(game, 'playerCard'));
      if (Object.hasOwn(game, 'opponentClaim')) {
         document.querySelector('#claim-instructions').textContent = 'You have claimed:';
         document.querySelector('#player-claim').classList.remove('selectable');
         document.querySelector('#opponent-claim').classList.add('visible');
         document.querySelector('#opponent-hand').classList.toggle('visible', game.playerClaim === game.opponentClaim);
         document.querySelector('#result').textContent = (
            game.playerClaim > game.opponentClaim
            ? 'Your claim is higher.\u{a0} '
            + 'You win your opponent\u{2019}s claim (+' + game.scoreChange + ').'
            : game.playerClaim < game.opponentClaim
            ? 'Your opponent\u{2019}s claim is higher.\u{a0} '
            + 'You lose your claim (\u{2212}' + -game.scoreChange + ').'
            : game.playerCard > game.opponentCard
            ? 'The claims are equal; your card is higher.\u{a0} '
            + 'You win your opponent\u{2019}s claim (+' + game.scoreChange + ').'
            : game.playerCard < game.opponentCard
            ? 'The claims are equal; your opponent\u{2019}s card is higher.\u{a0} '
            + 'You lose your claim (\u{2212}' + -game.scoreChange + ').'
            : 'The claims are equal; the cards are equal (0).'
         );
         document.querySelector('#result-section').classList.add('visible');
      } else {
         document.querySelector('#claim-instructions').textContent = 'Choose card to claim you have:';
         document.querySelector('#player-claim').classList.add('selectable');
         document.querySelector('#opponent-claim').classList.remove('visible');
         document.querySelector('#opponent-hand').classList.remove('visible');
         document.querySelector('#result').textContent = '\u{a0}';
         document.querySelector('#result-section').classList.remove('visible');
      }
      playerHandCards.forEach(function (playerHandCard, whichCard) {
         playerHandCard.classList.toggle('hidden', whichCard !== game.playerCard);
      });
      playerClaimCards.forEach(function (playerClaimCard, whichCard) {
         playerClaimCard.classList.toggle('selected', whichCard === game.playerClaim);
      });
      opponentClaimCards.forEach(function (opponentClaimCard, whichCard) {
         opponentClaimCard.classList.toggle('selected', whichCard === game.opponentClaim);
      });
      opponentHandCards.forEach(function (opponentHandCard, whichCard) {
         opponentHandCard.classList.toggle('hidden', whichCard !== game.opponentCard);
      });
      if (historyContext) {
         historyCanvas.width = game.scoreHistory.length;
         historyCanvas.height = game.highestScore - game.lowestScore + 1;
         historyContext.fillStyle = '#ffffff';
         historyContext.fillRect(0, 0, historyCanvas.width, historyCanvas.height);
         historyContext.fillStyle = '#cccccc';
         historyContext.fillRect(0, game.highestScore, historyCanvas.width, 1);
         historyContext.fillStyle = '#000000';
         game.scoreHistory.forEach(function (score, whichScore) {
            historyContext.fillRect(whichScore, game.highestScore - score, 1, 1);
         });
      }
      saveGame();
   };

   const startNewHand = function () {
      game.score += game.scoreChange;
      game.scoreHistory = [...game.scoreHistory, game.score];
      game.lowestScore = Math.min(game.lowestScore, game.score);
      game.highestScore = Math.max(game.highestScore, game.score);
      game.playerCard = Math.floor(Math.random() * game.numCards);
      delete game.playerClaim;
      delete game.opponentClaim;
      game.opponentCard = Math.floor(Math.random() * game.numCards);
      updateGameboard();
   };

   playerClaimCards.forEach(function (element, whichCard) {
      element.addEventListener('click', playerClaimFuncs[whichCard]);
      element.addEventListener('mousedown', function (ev) {
         ev.preventDefault();
      });
   });

   document.querySelector('#start-next-hand').addEventListener('click', startNewHand);

   document.addEventListener('keypress', function (ev) {
      const specialStrategies = {
         a: [3, 3, 3, 3], // always aggressively all-in
         c: [0, 0, 0, 3], // conservative: bet only when can't lose
         h: [0, 1, 2, 3], // honest
         s: [1, 0, 0, 3], // best strategy against default AI ("sneaky")
         w: [3, 3, 2, 0], // worst strategy against default AI
         z: [0, 0, 3, 3]  // all-in when likely to win a showdown
      };
      const key = (ev.key ?? String.fromCharCode(ev.charCode))?.toLowerCase?.();
      const card = (
         specialStrategies[key]?.[game.playerCard]
         ?? key.charCodeAt(0) - '1'.charCodeAt(0)
      );
      if (key === '!') {
         localStorage.removeItem(localStorageKey);
         game = getGameFromStorage();
         startNewHand();
      } else if (Object.hasOwn(game, 'opponentClaim')) {
         startNewHand();
      } else if (card >= 0 && card < game.numCards) {
         playerClaimFuncs[card]();
      }
   });

   if (Object.hasOwn(game, 'playerCard')) {
      updateGameboard();
   } else { // starting new history from scratch
      startNewHand();
   }
});
