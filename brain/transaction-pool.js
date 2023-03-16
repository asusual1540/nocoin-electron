import {Transaction} from "./transaction.js"

export class TransactionPool {
    constructor () {
        this.transaction_map = {}
    }

    set_transaction = (transaction) => {
        this.transaction_map[transaction.id] = transaction
    }
    clear = () => {
        this.transaction_map = {}
    }
    existing_transaction = ({input_address}) => {
        const transactions = Object.values(this.transaction_map)
        return transactions.find(transaction => transaction.input.address === input_address)
    }
    set_map = (transaction_map) => {
        this.transaction_map = transaction_map
    }

    valid_transactions = () => {
        return Object.values(this.transaction_map).filter(transaction => Transaction.valid_transaction(transaction))
    }

    clear_blockchain_transactions = ({ chain }) => {
        for (let i = 1; i < chain.length; i++) {
            let block = chain[i]

            for (let transaction of block.data) {
                if (this.transaction_map[transaction.id]) {
                    delete this.transaction_map[transaction.id]
                }
            }
        }
    }
}

