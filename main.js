// In this minigame we don't need main loop since everything
// is updated only when a player inputs something

// Obtains canvas and draws the background
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.fillStyle = '#fff'
ctx.fillRect(0, 0, canvas.width, canvas.height)

const pieces = new Image()
pieces.src = 'pieces.png'
// Loads the sprites and loads until done
pieces.onload = _ => {
    // Then starts and loads the chess
    const chess = new Chess(0, 4, canvas, pieces)
    chess.drawBoard()
    
    // Listener when piece is clicked
    canvas.addEventListener('click', e => {
        let bound = canvas.getBoundingClientRect()
        chess.click(e.clientX - bound.left, e.clientY - bound.top)
    })
}



/**
 * Gets the next char.
 */
function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1)
}

/**
 * Gets the previous char.
 */
function prevChar(c) {
    return String.fromCharCode(c.charCodeAt(0) - 1)
}