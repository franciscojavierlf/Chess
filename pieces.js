
class Player {
    constructor(id, ai) {
        this.__id = id
        this.__ai = ai
    }

    get id() {
        return this.__id
    }

    isAI() {
        return this.__ai > 0
    }

    getAILevel() {
        return this.__ai
    }
}

class Piece {

    static SIZE = 0

    constructor(board, player, type) {
        this.__board = board
        this.__player = player
        this.__type = type
        this.dragging = false
    }

    get player() {
        return this.__player
    }

    get type() {
        return this.__type
    }

    val() {
        return this.x + ", " + this.y + ", " + this.__type
    }

    getCopy(board = null) {
        throw 'getCopy function not implemented!'
    }

    getPossibleMove(x, y, i, board) {
        throw 'getPossibleMove function not implemented!'
    }

    canMove(x1, y1, x2, y2, board) {
        throw 'canMove function not implemented!'
    }

    move(x1, y1, x2, y2) {
        throw 'move function not implemented!'
    }
}

class Pawn extends Piece {

    constructor(board, player) {
        super(board, player, 'pawn')
        this.first = true
    }

    getCopy(board = null) {
        if (board == null) board = this.__board
        let p = new Pawn(board, this.player)
        p.first = this.first
        return p
    }

    getPossibleMove(x, y, i) {
        if (i >= 4) return null
        let t = this.player === 0 ? -1 : 1
        if (i === 0 && this.canMove(x, y, x, y + t))
            return { x: x, y: y + t }
        if (i === 1 && this.canMove(x, y, x, y + t + t))
            return { x: x, y: y + t + t }
        if (i === 2 && this.canMove(x, y, x - 1, y + t))
            return { x: x - 1, y: y + t }
        if (i === 3 && this.canMove(x, y, x + 1, y + t))
            return { x: x + 1, y: y + t }
        return { x: -1, y: -1 }
    }

    canMove(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false
        let p = this.__board.getPiece(x2, y2)
        let dx = Math.abs(x2 - x1) 
        let dy = this.player === 0 ? (y1 - y2) : (y2 - y1)
        return (dy === 1 && dx === 1 && p != null && p.player !== this.player) ||
            (dx === 0 && ((this.first && dy === 2) || dy === 1) && this.__board.isPathClear(x1, y1, x2, y2, null))
            && !this.__board.willBeCheck(x1, y1, x2, y2, this.player)
    }
}

class Tower extends Piece {

    constructor(board, player) {
        super(board, player, 'tower')
        this.first = true
    }

    getCopy(board = null) {
        if (board == null) board = this.__board
        let p = new Tower(board, this.player)
        p.first = this.first
        return p
    }

    getPossibleMove(x, y, i) {
        let xa, ya, tx, ty, p, check, ti = 0
        // Up, down, left, right
        for (let j = 0; j < 4; j++) {
            tx = 0
            ty = 0
            if (j === 0) ty = -1
            else if (j === 1) ty = 1
            else if (j === 2) tx = -1
            else tx = 1
            xa = x
            ya = y
            // Moves through the axis
            while (true) {
                xa += tx
                ya += ty
                if (xa < 0 || xa >= 8 || ya < 0 || ya >= 8)
                    break
                p = this.__board.getPiece(xa, ya)
                // End of the line
                if (p != null && p.player === this.player)
                    break
                // Skips the moves where there is a check
                if (!this.__board.willBeCheck(x, y, xa, ya, this.player)) {
                    // Returns the needed movement
                    if (ti === i) return { x: xa, y: ya }
                    ti++
                    // Can eat, so we count it in ti, but either way we leave
                    if (p != null && p.player !== this.player)
                        break
                }
            }
        }
        return null
    }

    canMove(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false
        let p = this.__board.getPiece(x2, y2)
        let dx = Math.abs(x2 - x1) 
        let dy = Math.abs(y2 - y1)
        return ((dx === 0 && dy !== 0) || (dy === 0 && dx !== 0))
            && this.__board.isPathClear(x1, y1, x2, y2, this.player)
            && !this.__board.willBeCheck(x1, y1, x2, y2, this.player)
    }
}

class Bishop extends Piece {

    constructor(board, player) {
        super(board, player, 'bishop')
    }

    getCopy(board = null) {
        if (board == null) board = this.__board
        return new Bishop(board, this.player)
    }

    getPossibleMove(x, y, i) {
        let xa, ya, tx, ty, p, check, ti = 0
        // Up, down, left, right
        for (let j = 0; j < 4; j++) {
            if (j === 0) {
                tx = -1
                ty = -1
            }
            else if (j === 1) {
                tx = -1
                ty = 1
            }
            else if (j === 2) {
                tx = 1
                ty = -1
            }
            else { 
                tx = 1
                ty = 1
            }
            xa = x
            ya = y
            // Moves through the axis
            while (true) {
                xa += tx
                ya += ty
                if (xa < 0 || xa >= 8 || ya < 0 || ya >= 8)
                    break
                p = this.__board.getPiece(xa, ya)
                // End of the line
                if (p != null && p.player === this.player)
                    break
                // Skips the moves where there is a check
                if (!this.__board.willBeCheck(x, y, xa, ya, this.player)) {
                    // Returns the needed movement
                    if (ti === i) return { x: xa, y: ya }
                    ti++
                    // Can eat, so we count it in ti, but either way we leave
                    if (p != null && p.player !== this.player)
                        break
                }
            }
        }
        return null
    }

    canMove(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false
        let p = this.__board.getPiece(x2, y2)
        let dx = Math.abs(x2 - x1) 
        let dy = Math.abs(y2 - y1)
        return dx !== 0 && dy !== 0 && dx === dy && this.__board.isPathClear(x1, y1, x2, y2, this.player)
            && !this.__board.willBeCheck(x1, y1, x2, y2, this.player)
    }
}

class Knight extends Piece {

    constructor(board, player) {
        super(board, player, 'knight')
    }

    getCopy(board = null) {
        if (board == null) board = this.__board
        return new Knight(board, this.player)
    }

    getPossibleMove(x, y, i) {
        if (i >= 8) return null
        let offsets = [ 1, -2, 2, -1, 2, 1, 1, 2, -1, 2, -2, 1, -2, -1, -1, -2 ]
        let nx = x + offsets[i * 2]
        let ny = y + offsets[i * 2 + 1]
        if (this.canMove(x, y, nx, ny))
            return { x: nx, y: ny }
        return { x: -1, y: -1 }
    }

    canMove(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false
        let p = this.__board.getPiece(x2, y2)
        let dx = Math.abs(x2 - x1)
        let dy = Math.abs(y2 - y1)
        return ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) &&
                (p == null || p.player !== this.player) && !this.__board.willBeCheck(x1, y1, x2, y2, this.player)
    }
}

class Queen extends Piece {

    constructor(board, player) {
        super(board, player, 'queen')
    }

    getCopy(board) {
        if (board == null) board = this.__board
        return new Queen(board, this.player)
    }
    
    getPossibleMove(x, y, i) {
        let xa, ya, tx, ty, p, check, ti = 0
        for (let j = 0; j < 8; j++) {
            if (j === 0) {
                 tx = -1
                 ty = 0
            }
            else if (j === 1) {
                tx = 1
                ty = 0
            }
            else if (j === 2) {
                tx = 0
                ty = -1
            }
            else if (j === 3) {
                tx = 0
                ty = 1
            }
            else if (j === 4) {
                tx = 1
                ty = 1
            }
            else if (j === 5) {
                tx = 1
                ty = -1
            }
            else if (j === 6) {
                tx = -1
                ty = 1
            }
            else if (j === 7) {
                tx = -1
                ty = -1
            }
            xa = x
            ya = y
            // Moves through the axis
            while (true) {
                xa += tx
                ya += ty
                if (xa < 0 || xa >= 8 || ya < 0 || ya >= 8)
                    break
                p = this.__board.getPiece(xa, ya)
                // End of the line
                if (p != null && p.player === this.player)
                    break
                // Skips the moves where there is a check
                if (!this.__board.willBeCheck(x, y, xa, ya, this.player)) {
                    // Returns the needed movement
                    if (ti === i) return { x: xa, y: ya }
                    ti++
                    // Can eat, so we count it in ti, but either way we leave
                    if (p != null && p.player !== this.player)
                        break
                }
            }
        }
        return null
    }

    canMove(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false
        let p = this.__board.getPiece(x2, y2)
        let dx = Math.abs(x2 - x1) 
        let dy = Math.abs(y2 - y1)
        return ((dx === 0 && dy !== 0) || (dy === 0 && dx !== 0) ||
            (dx !== 0 && dy !== 0 && dx === dy)) && this.__board.isPathClear(x1, y1, x2, y2, this.player)
            && !this.__board.willBeCheck(x1, y1, x2, y2, this.player)
    }
}

class King extends Piece {

    constructor(board, player) {
        super(board, player, 'king')
        this.first = true
    }

    getCopy(board = null) {
        if (board == null) board = this.__board
        let p = new King(board, this.player)
        p.first = this.first
        return p
    }
    
    getPossibleMove(x, y, i) {
        if (i >= 10) return null
        let offsets = [ -1, -1, 0, -1, 1, -1, 1, 0, 1, 1, 0, 1, -1, 1, -1, 0, -2, 0, 2, 0 ]
        let nx = x + offsets[i * 2]
        let ny = y + offsets[i * 2 + 1]
        if (this.canMove(x, y, nx, ny))
            return { x: nx, y: ny }
        return { x: -1, y: -1 }
    }
    
    canMove(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= 8 || y1 < 0 || y1 >= 8 || x2 < 0 || x2 >= 8 || y2 < 0 || y2 >= 8)
            return false
        let p = this.__board.getPiece(x2, y2)
        let dx = Math.abs(x2 - x1) 
        let dy = Math.abs(y2 - y1)
        // Enroque
        if (this.first && ((this.player === 0 && ((x2 === 2 && y2 === 7) || (x2 === 6 && y2 === 7)))
            || (this.player === 1 && ((x2 === 2 && y2 === 0) || (x2 === 6 && y2 === 0))))
            && !this.__board.isAttacked(x1, y1, this.player)) {
            let xa = x2 === 2 ? 0 : 7
            let ya = this.player === 0 ? 7 : 0
            let t = this.__board.getPiece(xa, ya)
            // Checks if the movement is valid
            if (t != null && t.type === 'tower' && t.first && this.__board.isPathClear(x1, y1, xa, ya, (this.player + 1) % 2)) {
                // Then checks if we are being attacked in the way
                let t = x2 === 2 ? -1 : 1
                return !this.__board.willBeAttacked(x1, y1, x1 + t, y1, this.player)
                    && !this.__board.willBeAttacked(x1, y1, x1 + t + t, y1, this.player)
            }
        }
        // Normal
        else return ((dx === 0 && dy === 1) || (dy === 0 && dx === 1) ||
                (dx === 1 && dy === 1)) && (p == null || p.player !== this.player)
                && !this.__board.willBeAttacked(x1, y1, x2, y2, this.player)
    }
}