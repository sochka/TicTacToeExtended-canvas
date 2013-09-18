"use strict";

var gameLogicTest = new TestCase("GameLogicTest");

gameLogicTest.prototype.testTurnLeadsToSameSquare = function () {
  var game = new TicTacToeGame();
  assertTrue(game.turnLeadsToSameSquare({x: 0, y: 0}));
  assertTrue(game.turnLeadsToSameSquare({x: 8, y: 0}));
  assertTrue(game.turnLeadsToSameSquare({x: 4, y: 4}));
  assertFalse(game.turnLeadsToSameSquare({x: 4, y: 2}));
  assertFalse(game.turnLeadsToSameSquare({x: 3, y: 4}));
};

gameLogicTest.prototype.testCell = function () {
  var coord = {y: 0, x: 0};
  assertTrue(new TicTacToeGame.Cell(coord).empty());
  assertFalse(new TicTacToeGame.Cell(coord, 1).empty());
  assertFalse(new TicTacToeGame.Cell(coord, 2).empty());

  assertSame(new TicTacToeGame.Cell(coord, 1).player, 1);
  assertSame(new TicTacToeGame.Cell(coord, 2).player, 2);
  assertException(function () {
    new TicTacToeGame.Cell(coord, -1);
  }, assert.AssertionError.name);
};

gameLogicTest.prototype.testDependencyOnPreviousMove = function () {
  var game = new TicTacToeGame();

  assertTrue(game.makeTurn({x: 0, y: 5}));
  assertFalse(game.isFirstMove());
  assertSame(game.previousTurnCoord.x , 0);
  assertSame(game.previousTurnCoord.y , 5);

  assertFalse(game.makeTurn({x: 0, y: 3}));
  assertFalse(game.makeTurn({x: 3, y: 8}));
  assertFalse(game.makeTurn({x: 5, y: 8}));

  assertSame(game.previousTurnCoord.x, 0);
  assertSame(game.previousTurnCoord.y, 5);
  assertTrue(game.makeTurn({x: 2, y: 8}));
};

gameLogicTest.prototype.testMoveSameCell = function () {
  var game = new TicTacToeGame();
  assertTrue(game.makeTurn({x: 1, y: 0}));
  assertTrue(game.makeTurn({x: 4, y: 0}));
  assertFalse(game.makeTurn({x: 1, y: 0}));
};

gameLogicTest.prototype.testSquareTopLeftCellCoord = function () {
  var game = new TicTacToeGame();
  assertSame(game.squareOwner[1][2].topLeftCellCoord.x, 6);
  assertSame(game.squareOwner[1][2].topLeftCellCoord.y, 3);
};

gameLogicTest.prototype.testNextSquare = function () {
  var game = new TicTacToeGame();
  assertException(function () {
    game.nextSquare();
  }, assert.AssertionError.name);
  game.makeTurn({y: 0, x: 1});

  assertSame(game.nextSquare().topLeftCellCoord.y, 0);
  assertSame(game.nextSquare().topLeftCellCoord.x, 3);
};

gameLogicTest.prototype.testCurrentPlayer = function () {
  var game = new TicTacToeGame();
  assertSame(game.currentPlayer, 1);
  game.makeTurn({x: 1, y: 0});
  assertSame(game.currentPlayer, 2);
  assertFalse(game.makeTurn({x: 1, y: 0}));
  assertSame(game.currentPlayer, 2);
};

gameLogicTest.prototype.testGameCutEarlierByDraw = function () {
  var game = new TicTacToeGame();
  var firstPlayerSquares = [[0, 0], [1, 1], [1, 2], [2, 0]],
    secondPlayerSquares = [[1, 0], [0, 1], [0, 2], [2, 2]];
  for (var i = 0; i < firstPlayerSquares.length; ++i) {
    assertFalse(game.impossibleToWin());
    game.squareOwner[firstPlayerSquares[i][1]][firstPlayerSquares[i][0]].player = 1;
    game.squareOwner[secondPlayerSquares[i][1]][secondPlayerSquares[i][0]].player = 2;
  }
  assertTrue(game.impossibleToWin());
};

gameLogicTest.prototype.testGameFinishable = function () {
  var nTests = 15;
  var nMaxConsequentFails = 1000;
  for (var test = 0; test < nTests; ++test) {
    var game = new TicTacToeGame(),
      maxMoves = game.size * game.size,
      moves = 0,
      consequentFails = 0;
    while (!game.winner() && moves < maxMoves && consequentFails < nMaxConsequentFails) {
      var tryCoord;
      if (!game.isFirstMove()) {
        tryCoord = {
          x: randRange(game.baseSize) + game.nextSquare().topLeftCellCoord.x,
          y: randRange(game.baseSize) + game.nextSquare().topLeftCellCoord.y
        };
      } else {
        tryCoord = {
          x: randRange(game.size),
          y: randRange(game.size)
        };
      }
      if (game.makeTurn(tryCoord)) {
        ++moves;
        consequentFails = 0;
      } else {
        ++consequentFails;
      }
    }
    assertNotSame('Game is stuck!',  game.winner(), TicTacToeGame.undefinedWinner);
    assertTrue(moves >= 17);
    console.log(moves +' moves; Winner: ' + game.winner());
  }
};
