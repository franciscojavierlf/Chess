
/**
 * A node for minimax and alpha-beta.
 */
class Node {
    constructor(player, turn, board) {
        this.__player = player
        this.__turn = turn
        this.__board = board
        this.__h = null
        this.__parent = null
        this.__children = []
        this.__passedChildren = []
        for (let i = 0; i < 8 << 3; i++)
            this.__passedChildren.push(false)
        this.__currentChild = this.__getNextRandomChild()
        this.__currentMovement = 0
    }

    /**
     * Returns the heuristic value of the board. Very important.
     */
    get h() {
        if (this.__h == null)
            this.__h = this.__board.getScore(this.__player)
        return this.__h
    }

    get parent() {
        return this.__parent
    }

    get board() {
        return this.__board
    }

    get children() {
        return this.__children
    }

    /**
     * Gets an index of a child that has not being created.
     */
    __getNextRandomChild() {
        // Gets a list of all the clear indexes
        let list = []
        for (let i = 0; i < this.__passedChildren.length; i++)
            if (!this.__passedChildren[i])
                list.push(i)
        // If there are no numbers left, so we return the max i
        if (list.length <= 0) return 8 << 3
        // Then selects a random index
        let i = Math.round(Math.random() * (list.length - 1))
        let j = list[i]
        // We update the child
        this.__passedChildren[j] = true
        // And we return
        return j
    }

    /**
     * Creates the next child without adding.
     */
    __getNextChild() {
        let board = this.__board
        let p, pos = null, x, y, newTurn = (this.__turn + 1) % 2
        // Iterates through all squares until we find a piece to move
        while ((x = this.__currentChild % 8) >= 0 && (y = Math.floor(this.__currentChild / 8)) >= 0 &&
            ((p = board.getPiece(x, y)) == null || p.player !== newTurn ||
            (pos = p.getPossibleMove(x, y, this.__currentMovement++)) == null || pos.x < 0)) {
            if (pos == null) {
                this.__currentChild = this.__getNextRandomChild()
                this.__currentMovement = 0
            }

            // Ends the children generation
            if (this.__currentChild >= 8 << 3) return null
        }
        // Only the positive positions get out
        // Creates the new board
        board = new Board(board.getChess(), board)
        board.move(x, y, pos.x, pos.y)
        // Adds the child and returns
        let child = new Node(this.__player, newTurn, board)
        child.__parent = this
        return child
    }
    
    /**
     * Generates the next child.
     */
    generateNextChild() {
        let child = this.__getNextChild()
        if (child != null) this.__children.push(child)
        return child
    }

    /**
     * Checks if we can have more children.
     */
    canHaveChildren() {
        if (this.__children.length > 0) return true
        let oldChild = this.__currentChild
        let oldChildren = []
        for (let i = 0; i < this.__passedChildren.length; i++)
            oldChildren[i] = this.__passedChildren[i]
        let oldMovement = this.__currentMovement
        let res = this.__getNextChild() != null
        this.__currentChild = oldChild
        this.__passedChildren = oldChildren
        this.__currentMovement = oldMovement
        return res
    }

    isTerminal() {
        return !this.canHaveChildren()
    }
}

class InfNode {
    constructor(negative) {
        this.__negative = negative
    }

    get h() {
        return this.__negative ? -Infinity : Infinity
    }
}

/**
 * The brain to make a move.
 */
class Brain {

    constructor(chess) {
        this.__chess = chess
    }

    possibleMoveExist(player = null) {
        if (player != null)
            return !(new Node(player, (player + 1) % 2, this.__chess.board)).isTerminal()
        else return !(new Node(0, this.__chess.board)).isTerminal() &&
            !(new Node(1, this.__chess.board)).isTerminal()
    }

    getBestMove(player) {
        // Makes the first node and then gets the best possible move
        let origin = new Node(player.id, (player.id + 1) % 2, this.__chess.board)
        let best = this.__alphabeta(origin, player.getAILevel(), new InfNode(true), new InfNode(false), true)
        // Then with the best node we get the next possible move (depth = 1)
        best = this.__getNextMove(best)
        return best.board
    }

    /**
     * Gets the next possible move of a node (depth = 1).
     */
    __getNextMove(node) {
        while (node != null && node.parent != null && node.parent.parent != null)
            node = node.parent
        return node
    }

    /**
     * Gets a random node that has the given value.
     */
    /*
    __getHeuristicNode(origin, val) {
        // We check the par numbers of the depth since they are the possible movements
        let list = [], nodes = []
        this.__getNodesAtDepth(origin, 1, nodes)
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].h === val)
                list.push(nodes[i])
        }
        // Having the list, we get a random one
        let i = Math.round(Math.random() * list.length)
        if (i === list.length) i--
        return list[i]
    }
*/
    /**
     * Gets all the nodes at a certain depth.
     */
    __getNodesAtDepth(origin, depth, list) {
        if (depth === 0) list.push(origin)
        else for (const child of origin.children)
            this.__getNodesAtDepth(child, depth - 1, list)
    }

    /**
     * Alpha-Beta Pruning with Minimax.
     */
    __alphabeta(node, depth, a, b, max) {
        if (depth === 0 || node.isTerminal())
            return node
        let child, other = null
        if (max) {
            let val = new InfNode(true)
            // Generates children
            while((child = node.generateNextChild()) != null) {
                other = this.__alphabeta(child, depth - 1, a, b, false)
                if (val.h < other.h)
                    val = other
                if (a.h < other.h)
                    a = other
                if (a.h >= b.h) break
            }
            return val
        }
        else {
            let val = new InfNode(false)
            while((child = node.generateNextChild()) != null) {
                other = this.__alphabeta(child, depth - 1, a, b, true)
                if (val.h > other.h)
                    val = other
                if (b.h > other.h)
                    b = other
                if (a.h >= b.h) break
            }
            return val
        }
    }
}