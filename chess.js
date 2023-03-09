/**
 * The chess class that controls everything.
 */
class Chess {

    constructor(player1AI, player2AI, canvas, pieces) {
        this.__player1 = new Player(0, player1AI)
        this.__player2 = new Player(1, player2AI)
        this.__brain = new Brain(this)
        this.__canvas = canvas
        this.__board = null
        // The graphics
        this.__graphics = {
            piecesImg: pieces,
            checkSize: 30,
            borderSize: 25,
            letterOffset: 5,
            whiteBoardColor: '#e3af78',
            blackBoardColor: '#4f3213',
            selectedColor: '#e0d210',
            tablesColor: '#fc2803',
            checkColor: '#d4b728',
            mateColor: '#3b9407'
        }
        this.__selectedSquare = -1
        this.__currentPlayer = this.__player1
        this.__state = null
        this.__finished = false

        this.__createBoard()

        // Checks if the first player is an AI
        if (this.__player1.isAI())
            this.moveAI(this.__player1)
    }

    get board() {
        return this.__board
    }

    getBrain() {
        return this.__brain
    }

    click(x, y) {
        const bs = this.__graphics.borderSize
        const cs = this.__graphics.checkSize
        x = Math.floor((x - bs) / cs)
        y = Math.floor((y - bs) / cs)
        // First we check the status of the game
        // If there is no selection, we can only select our pieces
        if (this.__selectedSquare <= 0) {
            let p = this.__board.getPiece(x, y)
            // If the selected place has a piece of the current player
            if (p != null && p.player === this.__currentPlayer.id) {
                this.__selectedSquare = x + y * 8
            }
            this.drawBoard()
        }
        // If there is a selection, we can only choose possible moves or change of selection
        else {
            let xa = this.__selectedSquare % 8
            let ya = Math.floor(this.__selectedSquare / 8)
            // Change of selection
            let p = this.__board.getPiece(x, y)
            if (p != null && p.player === this.__currentPlayer.id) {
                this.__selectedSquare = x + y * 8
                this.drawBoard()
            }
            // Tries to move the piece
            else if (this.__board.getPiece(xa, ya).canMove(xa, ya, x, y)) {
                this.move(xa, ya, x, y)
                this.__selectedSquare = -1
            }
        }
    }

    /**
     * Moves a piece.
     */
    move(x1, y1, x2, y2) {
        if (this.__finished || x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8
            || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return
        this.__board.move(x1, y1, x2, y2)
        this.__nextTurn()
        this.__updateStatus()
        this.drawBoard()
        // Checks if the next move is an AI
        if (!this.__finished && this.__currentPlayer.isAI())
            this.moveAI(this.__currentPlayer)
    }

    moveAI(player) {
        this.__board = this.__brain.getBestMove(player)
        this.__nextTurn()
        this.__updateStatus()
        this.drawBoard()
        // Checks if the next move is an AI
        if (!this.__finished && this.__currentPlayer.isAI())
            this.moveAI(this.__currentPlayer)

    }

    __updateStatus() {
        if (this.__board.isCheckMate(this.__currentPlayer.id)) {
            this.__state = 'checkmate'
            this.__finished = true
        }
        else if (this.__board.isTables(this.__currentPlayer.id)) {
            this.__state = 'tables'
            this.__finished = true
        }
        else if (this.__board.isCheck(this.__currentPlayer.id))
            this.__state = 'check'
        else this.__state = null
    }

    __nextTurn() {
        this.__currentPlayer = (this.__currentPlayer.id + 1) % 2 === 0 ? this.__player1 : this.__player2
    }
    
    /**
     * Draws the board into a canvas.
     */
    drawBoard() {
        const ctx = this.__canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bs = this.__graphics.borderSize
        const cs = this.__graphics.checkSize
        const lo = this.__graphics.letterOffset
        const wbc = this.__graphics.whiteBoardColor
        const bbc = this.__graphics.blackBoardColor

        // Draws background
        ctx.fillStyle = wbc
        ctx.fillRect(0, 0, cs * 8 + bs * 2, cs * 8 + bs * 2)

        // Draws the checks border
        ctx.fillStyle = bbc
        ctx.fillRect(bs - 2, bs - 2, cs * 8 + 4, cs * 8 + 4)

        // Draws the letters
        ctx.fillStyle = bbc
        ctx.font = "bold 18px Times New Roman";
        // Left letters
        let curr = 8
        for (let y = 0; y < 8; y++) {
            ctx.fillText(curr, lo,  y * cs + cs + lo * 3)
            curr--
        }
        // Bottom numbers
        curr = 'A'
        for (let x = 0; x < 8; x++) {
            ctx.fillText(curr, x * cs + bs + lo, cs * 8 + bs * 2 - lo)
            curr = nextChar(curr)
        }

        // Draws the white checkers
        ctx.fillStyle = wbc
        for (let y = 0; y < 8; y++)
            for (let x = 0; x < 8; x++) {
                if ((x + y % 2) % 2 === 0)
                    ctx.fillRect(x * cs + bs, y * cs + bs, cs, cs)
            }
        
        // Draws the square indicator
        if (this.__state != null) {
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.__state === 'check' ? this.__graphics.checkColor :                           this.__state === 'tables' ? this.__graphics.tablesColor : this.__graphics.mateColor;
            ctx.rect(bs - ctx.lineWidth, bs - ctx.lineWidth, (8 << 5) - bs / 2 + ctx.lineWidth, (8 << 5) - bs / 2 + ctx.lineWidth)
            ctx.stroke();
        }

        // Finally draws the pieces
        this.__drawPieces(ctx)
    }

    /**
     * Creates the board for the first time.
     */
    __createBoard() {
        const b = []
        this.__board = new Board(this)
        // Sets the size
        Piece.SIZE = this.__graphics.checkSize
        // Adds blacks
        // Others
        b.push(new Tower(this.__board, 1)); b.push(new Knight(this.__board, 1))
        b.push(new Bishop(this.__board, 1)); b.push(new Queen(this.__board, 1))
        b.push(new King(this.__board, 1)); b.push(new Bishop(this.__board, 1))
        b.push(new Knight(this.__board, 1)); b.push(new Tower(this.__board, 1))
        // Pawns
        for (let i = 0; i < 8; i++)
            b.push(new Pawn(this.__board, 1))
        // Adds nulls
        for (let i = 0; i < 4 * 8; i++)
            b.push(null)
        // Adds whites
        // Pawns
        for (let i = 0; i < 8; i++)
            b.push(new Pawn(this.__board, 0))
        // Others
        b.push(new Tower(this.__board, 0)); b.push(new Knight(this.__board, 0))
        b.push(new Bishop(this.__board, 0)); b.push(new Queen(this.__board, 0))
        b.push(new King(this.__board, 0)); b.push(new Bishop(this.__board, 0))
        b.push(new Knight(this.__board, 0)); b.push(new Tower(this.__board, 0))

        // Finally we assign
        for (let y = 0; y < 8; y++)
            for (let x = 0; x < 8; x++)
                this.__board.setPiece(x, y, b[x + y * 8])
    }

    /**
     * Draws the pieces into the board.
     */
    __drawPieces(ctx) {
        const b = this.__board
        const p = this.__graphics.piecesImg
        const bs = this.__graphics.borderSize
        const cs = this.__graphics.checkSize
        const lo = this.__graphics.letterOffset
        const iw = p.width / 6 // Image width
        const ih = p.height / 2 // Image height
        let x, y, t, ix, iy, piece
        // Draws each piece
        for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
            piece = b.getPiece(x, y)
            // Skips nulls
            if (piece == null) continue
            // Draws
            t = piece.type
            iy = piece.player
            // Chooses the image
            if (t === 'pawn') ix = 5
            else if (t === 'tower') ix = 4
            else if (t === 'knight') ix = 3
            else if (t === 'bishop') ix = 2
            else if (t === 'queen') ix = 1
            else ix = 0
            // And draws
            ctx.drawImage(p, ix * iw, iy * iw, iw, ih, x * cs + bs, y * cs + bs, cs, cs)
        }
        // Draws the selected square
        if (this.__selectedSquare >= 0) {
            const ctx = this.__canvas.getContext('2d')
            let x = this.__selectedSquare % 8
            let y = Math.floor(this.__selectedSquare / 8)
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.__graphics.selectedColor;
            ctx.rect(x * cs + bs, y * cs + bs, cs, cs)
            ctx.stroke();
        }
    }
}