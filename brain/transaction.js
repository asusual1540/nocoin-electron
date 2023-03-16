import pkg from 'uuid'
import { verify_signature } from '../utils/index.js'

import { REWARD_INPUT, MINING_REWARD } from "../config.js"

const { v1: uuid } = pkg;

export class Transaction {
    constructor ({ sender_brain, recipient, amount, output_map, input }) {
        this.id = uuid()
        this.output_map = output_map || this.create_output_map({ sender_brain, recipient, amount })
        this.input = input || this.create_input({ sender_brain, output_map: this.output_map })
    }

    create_output_map ({ sender_brain, recipient, amount}) {
        const output_map = {}

        output_map[recipient] = amount
        output_map[sender_brain.public_key] = sender_brain.balance - amount

        return output_map
    }

    create_input ({ sender_brain, output_map}) {
        return {
            timestamp : Date.now(),
            amount : sender_brain.balance,
            address : sender_brain.public_key,
            signature : sender_brain.sign(output_map)
        }
    }

    update ({ sender_brain, recipient, amount }) {
        if (amount > this.output_map[sender_brain.public_key]) {
            throw new Error('Amount exceeds balance')
        }

        if (!this.output_map[recipient]) {
            this.output_map[recipient] = amount
        } else {
            this.output_map[recipient] = this.output_map[recipient] + amount
        }

        
        this.output_map[sender_brain.public_key] = this.output_map[sender_brain.public_key] - amount

        this.input = this.create_input({ sender_brain, output_map : this.output_map})
    }

    static valid_transaction ( transaction ) {
        const { input : { address, amount, signature}, output_map } = transaction
        const output_total = Object.values(output_map).reduce((total, output_amount) => total + output_amount)

        if (amount !== output_total) {
            console.error(`Invalid transaction from ${address}`)
            return false
        }
        if (!verify_signature({ public_key: address, data: output_map, signature })) {
            console.error(`Invalid signature from ${address}`)
            return false
        }
        return true
    }

    static reward_transaction ({ minerWallet }) {
        return new this({
            input: REWARD_INPUT,
            output_map: {[minerWallet.public_key] : MINING_REWARD}
        })
    }
}

