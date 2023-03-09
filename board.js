
class Board {

    constructor(chess, board = null) {
        this.__grid = []
        this.__chess = chess
        let p
        if (board != null)
            for (let i = 0; i < board.__grid.length; i++) {
                p = board.__grid[i]
                if (p != null)
                    this.__grid[i] = p.getCopy(this)
                else this.__grid[i] = null
            }
    }

    getChess() {
        return this.__chess
    }

    move(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return
        let p = this.getPiece(x1, y1)
        if (p == null) return
        // Special case for enroque
        if (p.type === 'king' && p.first && Math.abs(x2 - x1) === 2) {
            if (x2 === 2) this.move(0, y1, 3, y1)
            else this.move(7, y1, 5, y1)
        }
        // Normal
        this.setPiece(x1, y1, null)
        this.setPiece(x2, y2, p)
        if (p.first != null) p.first = false
    }
    
    /**
     * Checks if there are no pieces. Avoids the indicated player in the last location.
     * Reduced like 60 lines of code to this. :)
     */
    isPathClear(x1, y1, x2, y2, player) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false

        let dx, dy, tx, ty, p
        dy = Math.abs(y2 - y1)
        dx = Math.abs(x2 - x1)
        if (dx !== dy && dx !== 0  && dy !== 0)
            return false
        tx = dx === 0 ? 0 : x1 > x2 ? -1 : 1
        ty = dy === 0 ? 0 : y1 > y2 ? -1 : 1
        for (let xi = tx, yi = ty; (dx !== 0 && Math.abs(xi) <= dx) || (dy !== 0 && Math.abs(yi) <= dy); xi += tx, yi += ty) {
            p = this.getPiece(x1 + xi, y1 + yi)
            if (p != null && (player == null || Math.abs(xi) < dx || Math.abs(yi) < dy || p.player === player))
                return false
        }
        return true
    }
    /**
     * Checks if the board is in check. The parameters are for calculating
     * a future check.
     */
    isCheck(player = null) {
        let k
        for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++)
            if ((k = this.getPiece(x, y)) != null && k.type === 'king' &&
                (player == null || k.player === player) && this.isAttacked(x, y, k.player))
                return true
        return false
    }

    willBeCheck(x1, y1, x2, y2, player = null) {
        let b = new Board(this.__chess, this)
        b.move(x1, y1, x2, y2)
        return b.isCheck(player)
    }

    willBeAttacked(x1, y1, x2, y2, player) {
        let b = new Board(this.__chess, this)
        b.move(x1, y1, x2, y2)
        return b.isAttacked(x2, y2, player)
    }

    isAttacked(x, y, player) {
        let p, dx, dy
        for (let ya = 0; ya < 8; ya++)
        for (let xa = 0; xa < 8; xa++) {
            p = this.getPiece(xa, ya)
            if (p == null || p.player === player) continue
            dx = Math.abs(xa - x)
            dy = Math.abs(ya - y)
            switch (p.type) {
                case 'pawn':
                    if (dx === 1 && ((p.player === 0 && ya - y === 1) || (p.player === 1 && y - ya === 1)))
                        return true
                    break
                case 'knight':
                    if ((dx === 1 && dy === 2) || (dx === 2 && dy === 1))
                        return true
                    break
                case 'bishop':
                    if (dx !== 0 && dy !== 0 && dx === dy && this.isPathClear(xa, ya, x, y, p.player))
                        return true
                    break
                case 'tower':
                    if (((dx === 0 && dy !== 0) || (dx !== 0 && dy === 0)) && this.isPathClear(xa, ya, x, y, p.player))
                        return true
                    break
                case 'queen':
                    if (((dx === 0 && dy !== 0) || (dx !== 0 && dy === 0) || (dx !== 0 && dy !== 0 && dx === dy))
                        && this.isPathClear(xa, ya, x, y, p.player))
                        return true
                    break
                case 'king':
                    if (dx <= 1 && dy <= 1 && this.isPathClear(xa, ya, x, y, p.player))
                        return true
                    break
            }
        }
        return false
    }

    isCheckMate(player = null) {
        return this.isCheck(player) && !this.__chess.getBrain().possibleMoveExist(player)
    }

    isTables(player = null) {
        return !this.isCheck(player) && !this.__chess.getBrain().possibleMoveExist(player)
    }

    /**
     * Gets the piece in the grid.
     */
    getPiece(x, y) {
        if (x >= 0 && x < 8 && y >= 0 && y < 8)
            return this.__grid[x + y * 8]
        return null
    }

    setPiece(x, y, piece) {
        if (x >= 0 && x < 8 && y >= 0 && y < 8)
            this.__grid[x + y * 8] = piece
    }

    /**
     * Gives a score to the board.
     */

    static __whiteKingValues    = [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0- -4.0, -3.0,
                                    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
                                    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
                                    -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
                                    -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0,
                                    -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0,
                                     2,0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0,
                                     2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]

    static __whiteQueenValues   = [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0,
                                    -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
                                    -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
                                    -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
                                    -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
                                    -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
                                    -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0,
                                    -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0 ]

    static __whiteTowerValues   = [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
                                     0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5,
                                    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
                                    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
                                    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
                                    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
                                    -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
                                     0.0,  0.0,  0.0,  0.5,  0.5,  0.0,  0.0,  0.0 ]

    static __whiteBishopValues  = [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0,
                                    -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
                                    -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0,
                                    -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0,
                                    -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0,
                                    -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
                                    -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0,
                                    -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0 ]

    static __whiteKnightValues  = [ -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0,
                                    -4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0,
                                    -3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0,
                                    -3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0,
                                    -3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0,
                                    -3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0,
                                    -4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0,
                                    -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0 ]

    static __whitePawnValues    = [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
                                     5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,
                                     1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0,
                                     0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5,
                                     0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0,
                                     0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5,
                                     0.5,  1.0,  1.0, -2.0, -2.0,  1.0,  1.0,  0.5,
                                     0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0 ]

    getScore(player) {
        // The main grade is counting the pieces by value
        let other = (player + 1) % 2
        let p, aux, pos, index, grade = 0
        for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
            p = this.__grid[x + y * 8]
            if (p != null) {
                aux = 0
                switch (p.type) {
                    case 'pawn':
                        aux += 1
                        pos = Board.__whitePawnValues
                        break
                    case 'bishop':
                        aux += 3
                        pos = Board.__whiteBishopValues
                    case 'knight':
                        aux += 3
                        pos = Board.__whiteKnightValues
                        break
                    case 'tower':
                        aux += 5
                        pos = Board.__whiteTowerValues
                        break
                    case 'queen':
                        aux += 10
                        pos = Board.__whiteQueenValues
                        break
                    case 'king':
                        pos = Board.__whiteKingValues
                        break
                }
                // Adds the value of pieces
                aux *= p.player === player ? 2 : -2
                // Then multiplies by a factor of position
                if (p.player === 0) aux += pos[x + y * 8]
                else aux -= pos[x + (7 - y) * 8]
                grade += aux
            }
        }
        // Then we have extras for checks and mates
        if (this.isCheckMate(player)) grade -= 1000
        else if (this.isCheckMate(other)) grade += 1000
        else if (this.isCheck(player)) grade -= 50
        else if (this.isCheck(other)) grade += 5
        else if (this.isTables(player)) grade -= 50
        else if (this.isTables(other)) grade -= 50

        return grade
    }
}