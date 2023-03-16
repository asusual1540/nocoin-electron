import {Block} from "./block.js" 
import {Brain} from "../brain/index.js"
import {Transaction} from "../brain/transaction.js"
import {crypto_hash} from "../utils/crypto_hash.js"
import { REWARD_INPUT, MINING_REWARD } from "../config.js"

export class Blockchain {
    constructor () {
        this.chain = [Block.genesis()]
    }


    add_block ({data}) {
        const new_block = Block.mine_block({
            last_block: this.chain[this.chain.length - 1],
            data
        })

        this.chain.push(new_block)
    }


    replace_chain (chain, on_success) {
        if (chain.length <= this.chain.length) {
            console.log("Incoming chain must be longer")
            return
        }
        if (!Blockchain.is_valid_chain(chain)) {
            console.log("Incoming chain is not valid")
            return
        }
        if (!this.valid_transaction_data({ chain })) {
            console.log("Incoming chain has invalid transaction data")
            return
        }
        if (on_success) on_success()
        console.log("Replacing chain with ", chain)
        this.chain = chain
    }

    valid_transaction_data = ({chain}) => {
        for (let i = 0; i < chain.length; i++) {
            let block = chain[i]
            const transaction_set = new Set()
            let reward_transaction_count = 0

            for (let transaction in block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    reward_transaction_count += 1

                    if (reward_transaction_count > 1) {
                        console.log("Reward limit exceeds")
                        return false
                    }
                    if (Object.values(transaction.output_map)[0] !== MINING_REWARD) {
                        console.log("Invalid Mining Reward")
                        return false
                    }
                } else {
                    if (!Transaction.valid_transaction(transaction)) {
                        console.log("Invalid Transaction")
                        return false
                    }

                    const true_balance = Brain.calculate_balance({ chain: this.chain, address: transaction.input.address })
                    if (transaction.input.amount !== true_balance) {
                        console.log("Invalid Input Amount")
                        return false
                    }
                    if (transaction_set.has(transaction)) {
                        console.log("Identical transaction")
                        return false
                    } else {
                        transaction_set.add(transaction)
                    }
                }
                
            }
        }
        return true
    }


    static is_valid_chain (chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }
        for (let i = 1; i < chain.length; i++) {
            const {timestamp, last_hash, hash, data, nonce, difficulty} = chain[i]
            const actual_last_hash = chain[i - 1].hash
            const last_difficulty = chain[i - 1].difficulty
            if (last_hash !== actual_last_hash) return false
            const validated_hash = crypto_hash(timestamp, last_hash, data, nonce, difficulty)
            if (hash !== validated_hash) return false
            if (Math.abs(last_difficulty - difficulty) > 1) return false
        }
        return true
    }

    
}

