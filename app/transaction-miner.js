import {Transaction} from "../brain/transaction.js"

export class TransactionMiner {
    constructor ({ blockchain, transaction_pool, problem_pool, brain, ipfs }) {
        this.blockchain = blockchain
        this.transaction_pool = transaction_pool
        this.brain = brain
        this.ipfs = ipfs
    }

    mine_transactions = () => {
        const valid_transactions = this.transaction_pool.valid_transactions()
        valid_transactions.push(Transaction.reward_transaction({ minerWallet: this.brain }))
        this.blockchain.add_block({ data : valid_transactions })
        // this.ipfs.broadcast_chain("BLOCKCHAIN")
        this.transaction_pool.clear()
    }
}

