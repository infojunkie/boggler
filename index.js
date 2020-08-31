const trie = require('trie-prefix-tree')

// "New" English Boggle
const ENGLISH_NEW = [
  ['A','A','E','E','G','N'],
  ['A','B','B','J','O','O'],
  ['A','C','H','O','P','S'],
  ['A','F','F','K','P','S'],
  ['A','O','O','T','T','W'],
  ['C','I','M','O','T','U'],
  ['D','E','I','L','R','X'],
  ['D','E','L','R','V','Y'],
  ['D','I','S','T','T','Y'],
  ['E','E','G','H','N','W'],
  ['E','E','I','N','S','U'],
  ['E','H','R','T','V','W'],
  ['E','I','O','S','S','T'],
  ['E','L','R','T','T','Y'],
  ['H','I','M','N','U','Qu'],
  ['H','L','N','N','R','Z'],
]


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

// Read wordlist and convert it to trie data structure https://en.wikipedia.org/wiki/Trie
// for fast querying.
function dictionary(wordlist) {
  return trie(
    require('fs')
    .readFileSync(wordlist, 'utf-8')
    .split('\n')
    .filter(Boolean)
  )
}

class Boggle {
  constructor(dice) {
    // Board is a square based on how may dice we have.
    const dim = Math.sqrt(dice.length)

    // Create empty board.
    // https://stackoverflow.com/a/60226400/209184
    this.board = Array(dim).fill().map(() => Array(dim).fill(''))

    // Populate the board from the dice.
    dice.forEach(die => {
      const letter = die[getRandomInt(6)]
      while (true) {
        const row = getRandomInt(dim)
        const col = getRandomInt(dim)
        if (this.board[row][col] == '') {
          this.board[row][col] = letter
          break
        }
      }
    });
  }

  solve(dictionary) {
    let solutions = []

    this.board.forEach((row, rowNum) => {
      row.forEach((letter, colNum) => {
        solutions = solutions.concat(this.solveRecursive(dictionary, letter, [ [rowNum, colNum] ]))
      })
    })

    return [...new Set(solutions)]
  }

  solveRecursive(dictionary, word, path) {
    let solutions = []

    if (word.length >= 3 && dictionary.hasWord(word)) {
      solutions.push(word)
    }

    if (dictionary.isPrefix(word)) {
      [
        [-1, -1], [-1, 0], [-1, 1],
        [ 0, -1], [ 0, 0], [ 0, 1],
        [ 1, -1], [ 1, 0], [ 1, 1]
      ].forEach( (neighbour) => {
        const rowNeighbour = path[path.length-1][0] + neighbour[0]
        const colNeighbour = path[path.length-1][1] + neighbour[1]
        if (
          rowNeighbour >= 0 && rowNeighbour < this.board.length &&
          colNeighbour >= 0 && colNeighbour < this.board.length &&
          !path.find(cell => cell[0] == rowNeighbour && cell[1] == colNeighbour)
        ) {
          solutions = solutions.concat(this.solveRecursive(
            dictionary,
            word + this.board[rowNeighbour][colNeighbour],
            path.concat([ [rowNeighbour, colNeighbour] ])
          ))
        }
      })
    }

    return [...new Set(solutions)]
  }
}

const game = new Boggle(ENGLISH_NEW)
const dict = dictionary('./wordlists/sowpods')
console.log(game.board)
console.log(game.solve(dict))
