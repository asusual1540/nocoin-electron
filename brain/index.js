import {Transaction} from './transaction.js'
import {Puzzle} from './puzzle.js'
import { STARTING_BALANCE, STARTING_WISDOM } from '../config.js'
import { ec } from '../utils/index.js'
import { crypto_hash } from '../utils/crypto_hash.js'

export class Brain {
    constructor () {
        this.wisdom = STARTING_WISDOM
        this.balance = STARTING_BALANCE
        this.key_pair = ec.genKeyPair()
        this.public_key = this.key_pair.getPublic().encode('hex')
    }

    sign (data) {
        return this.key_pair.sign(crypto_hash(data))
    }

    create_transaction ({ recipient, amount, chain }) {
        if (chain) {
            this.balance = Brain.calculate_balance({chain: chain, address: this.public_key})
        }
        if (amount > this.balance) {
            throw new Error('Amount exceeds balance')
        }
        return new Transaction({ sender_brain: this, recipient, amount })
    }

    create_puzzle ({ puzzle_map, value, domain, category, subject, level, difficulty, description, rules, answer, hint }) {
        console.log("creating puzzle")
        if (puzzle_map) {
            this.wisdom = Brain.calculate_wisdom({ puzzle_map: puzzle_map, address: this.public_key})
        }
        if (value > this.wisdom) {
            throw new Error('Amount exceeds wisdom')
        }
        
        const puzzle =  new Puzzle({ creator_brain: this, value, domain, category, subject, level, difficulty, description, rules, answer, hint })
        console.log("puzzle", puzzle)
        return puzzle
    }

    static calculate_wisdom ({ puzzle_map, address }) {
        const puzzle_list = Object.values(puzzle_map)
        let total_wisdom_spent = 0
        let has_created_puzzle = false
        for (let i = puzzle_list.length - 1; i >= 0; i--) {
            let puzzle = puzzle_list[i]
            
            if (puzzle.output_map[address]) {
                has_created_puzzle = true
                total_wisdom_spent += puzzle.input.value
                console.log("total_wisdom_spent", total_wisdom_spent)
            }
        }

        return has_created_puzzle ? Math.abs(STARTING_WISDOM - total_wisdom_spent) : STARTING_WISDOM + total_wisdom_spent
    }
    static calculate_balance ({ chain, address }) {
        let has_conducted_transaction = false
        let output_total = 0
        for (let i = chain.length - 1; i >= 0; i--) {
            let block = chain[i]

            for (let data in block.data) {
                if (data.tx.transaction.input.address === address) {
                    has_conducted_transaction = true
                }
                if (data.tx.transaction.output_map[address]) {
                    output_total += data.tx.transaction.output_map[address]
                }
            }
            if (has_conducted_transaction) {
                break
            }
        }
        return has_conducted_transaction ? output_total : STARTING_BALANCE + output_total
    }
}

