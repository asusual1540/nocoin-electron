import hex_to_binary from "hex-to-binary"
import {GENESIS_DATA, MINE_RATE} from '../config.js'
import {crypto_hash} from '../utils/crypto_hash.js'

export class Block {
    constructor ({timestamp, last_hash, hash, data, puzzle, answer, difficulty}) {
        this.timestamp = timestamp
        this.last_hash = last_hash
        this.hash = hash
        this.data = data
        this.puzzle = puzzle
        this.answer = answer
        this.difficulty = difficulty
    }
    static genesis () {
        const genesis_block = new this(GENESIS_DATA)
        return genesis_block
    }
    static mine_block ({last_block, data}) {
        const last_hash = last_block.hash
        let hash, timestamp
        let {difficulty} = last_block
        let answer = 0
        do {
            answer++
            timestamp = Date.now()
            difficulty = Block.adjust_difficulty(last_block, timestamp)
            hash = crypto_hash(timestamp, last_hash, data, answer, difficulty)
        } while (hex_to_binary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this({timestamp, last_hash, data, hash, answer, difficulty})
    }
    static adjust_difficulty (original_block, timestamp) {
        const {difficulty} = original_block
        if (difficulty < 1) return 1
        if ((timestamp - original_block.timestamp) > MINE_RATE) return difficulty - 1
        return difficulty + 1
    }
    static intelligent_mine_block ({last_block, data}) {
        const last_hash = last_block.hash
        let hash, timestamp
        let {difficulty} = last_block
        let answer = 0
        do {
            answer++
            timestamp = Date.now()
            difficulty = Block.adjust_difficulty(last_block, timestamp)
            hash = crypto_hash(timestamp, last_hash, data, answer, difficulty)
        } while (hex_to_binary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

        return new this({timestamp, last_hash, data, hash, answer, difficulty})
    }
}
