import {Puzzle} from "./puzzle.js"

export class PuzzlePool {
    constructor () {
        this.puzzle_map = {}
    }

    set_puzzle = (puzzle) => {
        this.puzzle_map[puzzle.id] = puzzle
    }
    
    solve_puzzle = (solver_brain, id, solution, status) => {
        let result = false
        console.log("incoming id", id)
        console.log("incoming id type", typeof(id))
        console.log("this puzzle map", this.puzzle_map[id])
        if (this.puzzle_map[id]) {
            const puzzle = this.puzzle_map[id]
            console.log("puzzle from pool", puzzle)
            result = Puzzle.solve_puzzle(solver_brain, puzzle, solution, status)
        } 
        return result
    }
    clear = () => {
        this.puzzle_map = {}
    }
    // existing_puzzle = ({input_address}) => {
    //     const puzzles = Object.values(this.puzzle_map)
    //     return puzzles.find(puzzle => puzzle.input.address === input_address)
    // }
    set_map = (puzzle_map) => {
        this.puzzle_map = puzzle_map
    }

    valid_puzzle = () => {
        return Object.values(this.puzzle_map).filter(puzzle => puzzle.valid_puzzle(puzzle))
    }

    clear_blockchain_puzzles = ({ chain }) => {
        for (let i = 1; i < chain.length; i++) {
            let block = chain[i]

            for (let data of block.data) {
                if (this.puzzle_map[data.puzzle.id]) {
                    delete this.puzzle_map[data.puzzle.id]
                }
            }
        }
    }
}

