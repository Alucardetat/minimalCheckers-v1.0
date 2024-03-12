window.onload = function () {
  // The initial setup
  let gameBoard = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0]
  ];
  
  // Arrays to store the instances
  let pieces = [];
  let tiles = [];

  // Distance formula
  let dist = function (x1, y1, x2, y2) {
  // Math.sqrt calculates the square root
  // Math.pow(a, b) calculates a raised to the power of b
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
  }
  
  // Piece object - Represents a game piece in checkers. There are 24 instances in a game.
  function Piece(element, position) {
  // Flag indicating whether the piece is allowed to move (affected by jumps), when jump exist, regular move is not allowed
    this.allowedtomove = true;

  // Linked DOM element representing the piece
    this.element = element;

  // Position on the game board in the format [row, column]
    this.position = position;

  // Player to whom the piece belongs (Player 1 or Player 2)
    this.player = '';

  // Determine the player based on the piece's DOM element ID
    if (this.element.attr("id") < 12)
      this.player = 1;
    else
      this.player = 2;

  // Flag indicating whether the piece is a king
    this.king = false;

  // Method to make the piece a king by updating its appearance
    this.makeKing = function () {
      this.element.css("backgroundImage", "url('images/king" + this.player + ".png')");
      this.king = true;
    }
   
  // Method to move the piece to a specified tile
    this.move = function (tile) {
      this.element.removeClass('selected');

  // Check if the move is valid based on game rules
      if (!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) return false;

  // Ensure the piece doesn't move backward if it's not a king
      if (this.player == 1 && this.king == false) {
        if (tile.position[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if (tile.position[0] > this.position[0]) return false;
      }

  // Update the game board and the piece's position
      Board.board[this.position[0]][this.position[1]] = 0;
      Board.board[tile.position[0]][tile.position[1]] = this.player;
      this.position = [tile.position[0], tile.position[1]];

  // Update the CSS using the board's dictionary
      this.element.css('top', Board.dictionary[this.position[0]]);
      this.element.css('left', Board.dictionary[this.position[1]]);

  // If the piece reaches the end of the row on the opposite side, crown it as a king
      if (!this.king && (this.position[0] == 0 || this.position[0] == 7))
        this.makeKing();
      return true;
    };

  // Method to check if the piece can jump to any location
    this.canJumpAny = function () {
      return (this.canOpponentJump([this.position[0] + 2, this.position[1] + 2]) ||
        this.canOpponentJump([this.position[0] + 2, this.position[1] - 2]) ||
        this.canOpponentJump([this.position[0] - 2, this.position[1] + 2]) ||
        this.canOpponentJump([this.position[0] - 2, this.position[1] - 2]))
    };

  // Method to test if an opponent's jump can be made to a specific place
    this.canOpponentJump = function (newPosition) {
  // Find what the displacement is
      let dx = newPosition[1] - this.position[1];
      let dy = newPosition[0] - this.position[0];

  // Make sure object doesn't go backwards if it's not a king
      if (this.player == 1 && this.king == false) {
        if (newPosition[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if (newPosition[0] > this.position[0]) return false;
      }

  // Must be within bounds of the board
      if (newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;

  // Middle tile where the piece to be conquered sits
      let tileToCheckx = this.position[1] + dx / 2;
      let tileToChecky = this.position[0] + dy / 2;
      if (tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0) return false;

  // If there is a piece there, and there is no piece in the space after that
      if (!Board.isValidPlacetoMove(tileToChecky, tileToCheckx) && Board.isValidPlacetoMove(newPosition[0], newPosition[1])) {
  // Find which object instance is sitting there
        for (let pieceIndex in pieces) {
          if (pieces[pieceIndex].position[0] == tileToChecky && pieces[pieceIndex].position[1] == tileToCheckx) {
            if (this.player != pieces[pieceIndex].player) {
  // Return the piece sitting there
              return pieces[pieceIndex];
            }
          }
        }
      }
      return false;
    };

  // Method to perform an opponent's jump if possible and remove the captured piece
    this.opponentJump = function (tile) {
      let pieceToRemove = this.canOpponentJump(tile.position);
  // If there is a piece to be removed, remove it
      if (pieceToRemove) {
        pieceToRemove.remove();
        return true;
      }
      return false;
    };

  // Method to remove the piece from the board and update game state
    this.remove = function () {
  // Remove it and delete it from the gameboard
      this.element.css("display", "none");
      if (this.player == 1) {
        $('#player2').append("<div class='capturedPiece'></div>");
        Board.score.player2 += 1;
      }
      if (this.player == 2) {
        $('#player1').append("<div class='capturedPiece'></div>");
        Board.score.player1 += 1;
      }
      Board.board[this.position[0]][this.position[1]] = 0;

  // Reset position so it doesn't get picked up by the for loop in the canOpponentJump method
      this.position = [];
      let playerWon = Board.checkifAnybodyWon();
      if (playerWon) {
        $('#winner').html("Player " + playerWon + " has won!");
      }
    }
  }
  ////
  ////
  ////
  ////
  ////
  // Tile object - Represents a tile on the checkers game board
  function Tile(element, position) {
  // Linked DOM element representing the tile
    this.element = element;

  // Position of the tile on the game board in the format [row, column]
    this.position = position;

  // Method to check if the tile is in range from the given piece
    this.inRange = function (piece) {
  // Check if there is a piece at the tile's position
      for (let k of pieces)
        if (k.position[0] == this.position[0] && k.position[1] == this.position[1]) return 'wrong';
        
  // Check if the piece is not a king and the move is in the wrong direction
      if (!piece.king && piece.player == 1 && this.position[0] < piece.position[0]) return 'wrong';
      if (!piece.king && piece.player == 2 && this.position[0] > piece.position[0]) return 'wrong';

  // Check if the calculated distance between the tile and the piece is equal to the square root of 2
      if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == Math.sqrt(2)) {
  // Regular move: The distance is the square root of 2, indicating a valid regular move
        return 'regular';
      } else if (dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == 2 * Math.sqrt(2)) {
  // Jump move: The distance is twice the square root of 2, indicating a valid jump move
        return 'jump';
      }
    };
  }
  ////
  ////
  ////
  ////
  ////
  // Board object - Manages the game board, players, and game state
  let Board = {
  // 2D array representing the game board
    board: gameBoard,
  // Player scores
    score: {
      player1: 0,
      player2: 0
    },
  // Current player's turn (1 or 2)
    playerTurn: 1,
  // Flags to track the existence of jumps
    jumpexist: false,
    continuousjump: false,
  // DOM element representing the tiles on the board
    tilesElement: $('div.tiles'),
  // Dictionary to convert position in Board.board to viewport units
    dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],

  // Initialize the 8x8 board, placing tiles and player pieces
    initalize: function () {
      let countPieces = 0;
      let countTiles = 0;
      for (let row in this.board) { //row is the index
        for (let column in this.board[row]) {
  // Set up the tiles and pieces based on the board configuration
          if (row % 2 == 1) {
            if (column % 2 == 0) {
              countTiles = this.tileRender(row, column, countTiles)
            }
          } else {
            if (column % 2 == 1) {
              countTiles = this.tileRender(row, column, countTiles)
            }
          }
  // Set up player pieces
          if (this.board[row][column] == 1) {
            countPieces = this.playerPiecesRender(1, row, column, countPieces)
          } else if (this.board[row][column] == 2) {
            countPieces = this.playerPiecesRender(2, row, column, countPieces)
          }
        }
      }
    },

  // Render a tile on the board
    tileRender: function (row, column, countTiles) {
      this.tilesElement.append("<div class='tile' id='tile" + countTiles + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
      tiles[countTiles] = new Tile($("#tile" + countTiles), [parseInt(row), parseInt(column)]);
      return countTiles + 1
    },

  // Render a player's piece on the board
    playerPiecesRender: function (playerNumber, row, column, countPieces) {
      $(`.player${playerNumber}pieces`).append("<div class='piece' id='" + countPieces + "' style='top:" + this.dictionary[row] + ";left:" + this.dictionary[column] + ";'></div>");
      pieces[countPieces] = new Piece($("#" + countPieces), [parseInt(row), parseInt(column)]);
      return countPieces + 1;
    },

  // Check if a location is empty and can be moved to
    isValidPlacetoMove: function (row, column) {
  // console.log(row); console.log(column); console.log(this.board);
      if (row < 0 || row > 7 || column < 0 || column > 7) return false;
      if (this.board[row][column] == 0) {
        return true;
      }
      return false;
    },

  // Change the active player's turn and update the UI
    changePlayerTurn: function () {
      if (this.playerTurn == 1) {
        this.playerTurn = 2;
        $('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%)");
      } else {
        this.playerTurn = 1;
        $('.turn').css("background", "linear-gradient(to right, #BEEE62 50%, transparent 50%)");
      }
  // Check if any jumps exist for the current player's pieces
      this.check_if_jump_exist()
      return;
    },

  // Check if any player has won the game
    checkifAnybodyWon: function () {
      if (this.score.player1 == 12) {
        return 1; // Player 1 has won
      } else if (this.score.player2 == 12) {
        return 2; // Player 2 has won
      }
      return false; // No winner yet
    },

  // Reset the game by reloading the page
    clear: function () {
      location.reload();
    },

  // Check if jumps exist for the current player's pieces
    check_if_jump_exist: function () {
      this.jumpexist = false
      this.continuousjump = false;
      for (let k of pieces) {
        k.allowedtomove = false;
  // If jumps exist, only set those "jump" pieces as "allowed to move"
        if (k.position.length != 0 && k.player == this.playerTurn && k.canJumpAny()) {
          this.jumpexist = true
          k.allowedtomove = true;
        }
      }
  // If no jumps exist, all pieces are allowed to move
      if (!this.jumpexist) {
        for (let k of pieces) k.allowedtomove = true;
      }
    },


  // Convert the board state to a string for possible communication with the back-end
    str_board: function () {
      let ret = "";
      for (let i in this.board) {
        for (let j in this.board[i]) {
          let found = false;
          for (let k of pieces) {
            if (k.position[0] == i && k.position[1] == j) {
  // Append the player's piece to the string (add 2 if it's a king)
              if (k.king) ret += (this.board[i][j] + 2)
              else ret += this.board[i][j]
              found = true
              break
            }
          }
          if (!found) ret += '0'; // Append '0' if no piece is found at the position
        }
      }
      return ret;
    }
  }
  ////
  ////
  ////
  ////
  ////
  // Initialize the board
  Board.initalize();
  ////
  ////
  ////
  ////
  ////
  //*** Events ***//
  ////
  ////
  ////
  ////
  ////
  // Event listener for selecting a piece on click, if it is the player's turn
  $('.piece').on("click", function () {
  // Flag to check if the piece is selected
    let selected;
  // Check if it is the current player's turn
    let isPlayersTurn = ($(this).parent().attr("class").split(' ')[0] == "player" + Board.playerTurn + "pieces");

  // Proceed if it's the player's turn
    if (isPlayersTurn) {
  // Check if there is no continuous jump and the piece is allowed to move
      if (!Board.continuousjump && pieces[$(this).attr("id")].allowedtomove) {
  // Check if the piece is already selected
        if ($(this).hasClass('selected')) selected = true;

  // Deselect all pieces and select the clicked piece if not already selected
        $('.piece').each(function (index) {
          $('.piece').eq(index).removeClass('selected')
        });
        if (!selected) {
          $(this).addClass('selected');
        }
      } else {
  // Display a message if the piece is not allowed to move due to jumps
        let exist = "jump exist for other pieces, that piece is not allowed to move"
        let continuous = "continuous jump exist, you have to jump the same piece"
        let message = !Board.continuousjump ? exist : continuous
        console.log(message)
      }
    }
  });
  ////
  ////
  ////
  ////
  ////
  // Event listener for the "Clear Game" button click
  $('#cleargame').on("click", function () {
  // Call the clear method of the Board object to reset the game
    Board.clear();
  });
  ////
  ////
  ////
  ////
  ////
  // Event listener for the click on a tile element
  $('.tile').on("click", function () {
  // Ensure that a piece is selected
    if ($('.selected').length != 0) {
  // Extract the unique identifier of the clicked tile
      let tileID = $(this).attr("id").replace(/tile/, '');
  // Retrieve the Tile object corresponding to the clicked tile
      let tile = tiles[tileID];
  // Retrieve the Piece object corresponding to the selected piece
      let piece = pieces[$('.selected').attr("id")];
  // Check if the tile is in the valid move range of the selected piece
      let inRange = tile.inRange(piece);

  // Check if the move is valid ('wrong' indicates an invalid move)
      if (inRange != 'wrong') {
  // If the move is a jump, execute the jump move
        if (inRange == 'jump') {
  // Check if an opponent's piece can be jumped and execute the jump
          if (piece.opponentJump(tile)) {
            piece.move(tile);
  // Check if another jump can be made (double and triple jumps)
            if (piece.canJumpAny()) {
  // Set the piece as selected to prevent de-selection or selection of other pieces
              piece.element.addClass('selected');
  // Set a flag indicating the existence of a continuous jump
              Board.continuousjump = true;
            } else {
  // If no more jumps are possible, change the player's turn
              Board.changePlayerTurn()
            }
          }
  // If the move is regular and no jumping is available, execute the regular move
        } else if (inRange == 'regular' && !Board.jumpexist) {
  // Check if the piece can make a regular move (not a jump)
          if (!piece.canJumpAny()) {
  // Execute the regular move and change the player's turn
            piece.move(tile);
            Board.changePlayerTurn()
          } else {
  // Display an alert if the player must jump when possible
            alert("You must jump when possible!");
          }
        }
      }
    }
  });
}