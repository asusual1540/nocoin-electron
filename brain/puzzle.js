import pkg from 'uuid'
import { verify_signature } from '../utils/index.js'
import { crypto_hash_puzzle } from '../utils/crypto_hash_puzzle.js'

import { REWARD_INPUT, MINING_REWARD } from "../config.js"

const { v1: uuid } = pkg

export class Puzzle {

    constructor ({ creator_brain, value, domain, category, subject, level, difficulty, description, rules, answer, hint }) {
        this.id = uuid()
        this.output_map = this.create_output_map({ creator_brain, value })
        this.input = this.create_input({ creator_brain, output_map: this.output_map, domain, category, subject, level, difficulty, description, rules, answer, hint, value})
        this.solver_map = {}
        this.calculated_difficulty = 1
        this.status = "UNDECIDED"
        this.invalid = 1
        this.valid = 1
        this.solved = 1
        this.wisdom_degeneration_factor = 1
        this.wisdom_regeneration_factor = 1
    }

    create_output_map ({ creator_brain, value}) {
        const output_map = {}
        output_map[creator_brain.public_key] = creator_brain.wisdom - value

        return output_map
    }
    calculate_output_map ({ brain, value}) {
        this.output_map[brain.public_key] = brain.wisdom - value

        return output_map
    }

    create_input ({ creator_brain, output_map, domain, category, subject, level, difficulty, description, rules, answer, hint, value}) {

        const data = {
            timestamp : Date.now(),
            domain : domain || 'cognitive',
            category : category || 'knowledge',
            subject : subject || 'math',
            level : level || '1',
            difficulty : difficulty || 'easy',
            description : description,
            rules : rules || 'no rules defined',
            hint : hint || 'no hint provided'
        }
        console.log("answer", answer)
        const hash =  crypto_hash_puzzle(data, answer)


        return {
            value : value,
            address : creator_brain.public_key,
            signature : creator_brain.sign(output_map),
            data: data,
            hash: hash
        }
    }



    static solve_puzzle (solver_brain, puzzle, answer, status) {
        // if (puzzle.solver_map[solver_brain.public_key]) {
        //     return "You have already reacted to this puzzle"
        // }
        
        const { input : { data } } = puzzle
        
        
        if (status === "invalid") {
            puzzle.solver_map[solver_brain.public_key] = {
                timestamp : Date.now(),
                status : "invalid",
                address : solver_brain.public_key,
                signature : solver_brain.sign({...data, answer: "invalid"}),
            }
            puzzle.invalid += 1
        } else if (status === "valid") {
            const desired_hash = puzzle.input.hash
            const answer_hash = crypto_hash_puzzle(puzzle.input.data, answer)
            if (desired_hash === answer_hash) {
                puzzle.solver_map[solver_brain.public_key] = {
                    timestamp : Date.now(),
                    status : "solved",
                    address : solver_brain.public_key,
                    signature : solver_brain.sign({...data, answer: answer}),
                }
                puzzle.solved += 1
            } else {
                puzzle.solver_map[solver_brain.public_key] = {
                    timestamp : Date.now(),
                    status : "valid",
                    address : solver_brain.public_key,
                    signature : solver_brain.sign({...data, answer: "valid"}),
                }
                puzzle.valid += 1
            }
            
            
        } 


        
        if (puzzle.solved && puzzle.valid) {
            puzzle.calculated_difficulty = puzzle.valid / (puzzle.solved + puzzle.valid)
        }
        if (puzzle.solved || puzzle.invalid) {
            let invalid_by_solved_ratio = puzzle.invalid / puzzle.solved
            let solved_by_invalid_ratio = puzzle.solved / puzzle.invalid
            
            if (invalid_by_solved_ratio > 1.618) {
                puzzle.status = "INVALID"
            } else if (solved_by_invalid_ratio > 1.618 && puzzle.calculated_difficulty < 0.618) {
                puzzle.status = "VALID"
            } else {
                puzzle.status = "UNDECIDED"
            }
        }
        

        return puzzle || false
    }

    // update ({ creator_brain, recipient, value }) {
    //     if (value > this.output_map[creator_brain.public_key]) {
    //         throw new Error('Amount exceeds balance')
    //     }

    //     if (!this.output_map[recipient]) {
    //         this.output_map[recipient] = value
    //     } else {
    //         this.output_map[recipient] = this.output_map[recipient] + value
    //     }

        
    //     this.output_map[creator_brain.public_key] = this.output_map[creator_brain.public_key] - value

    //     this.input = this.create_input({ creator_brain, output_map : this.output_map})
    // }

    static valid_puzzle ( puzzle ) {
        const { input : { address, value, signature}, output_map } = puzzle
        // const output_total = Object.values(output_map).reduce((output_value) => output_value)

        // if (value !== output_total) {
        //     console.error(`Invalid puzzle from ${address}`)
        //     return false
        // }
        if (!verify_signature({ public_key: address, data: output_map, signature })) {
            console.error(`Invalid signature from ${address}`)
            return false
        }
        return true
    }

    // static reward_transaction ({ minerWallet }) {
    //     return new this({
    //         input: REWARD_INPUT,
    //         output_map: {[minerWallet.public_key] : MINING_REWARD}
    //     })
    // }
}

