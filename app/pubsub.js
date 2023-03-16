import redis from 'redis';





export class PubSub {
    constructor ({blockchain, transaction_pool, puzzle_pool}) {
        this.blockchain = blockchain
        this.transaction_pool = transaction_pool
        this.puzzle_pool = puzzle_pool
        this.publisher = redis.createClient()
        this.subscriber = redis.createClient()
    }

    connect = async () => {
        await this.publisher.connect()
        await this.subscriber.connect()
    }

    handle_message = (channel, message) => {
        console.log(`Message received. Channel : ${channel}, Message: ${message}.`)
        if (channel == 'BLOCKCHAIN') {
            let parsed_message = JSON.parse(message)
            this.blockchain.replace_chain(parsed_message, () => {
                this.transaction_pool.clear_blockchain_transactions({ chain: parsed_message})
            })
        } else if (channel == 'TRANSACTION') {
            let parsed_message = JSON.parse(message)
         
            this.transaction_pool.set_transaction(parsed_message)
        } else if (channel == 'PUZZLE') {
            let parsed_message = JSON.parse(message)
         
            this.puzzle_pool.set_puzzle(parsed_message)
        }
    }
    subscribe =  async (channel) => {
        this.subscriber.subscribe(channel, (message) => {
            this.handle_message(channel, message)
        })
    }
    unsubscribe =  async (channel) => {
        await this.subscriber.unsubscribe(channel)
    }
    publish = async ({channel, message}) => {
        await this.unsubscribe(channel)
        await this.publisher.publish(channel, message)
        await this.subscribe(channel)
    }
    broadcast_chain = (channel) => {
        this.publish({
            channel: channel,
            message: JSON.stringify(this.blockchain.chain)
        })
    }
    broadcast_transaction = ({channel, transaction}) => {
        this.publish({
            channel: channel,
            message: JSON.stringify(transaction)
        })
    }
    broadcast_puzzle = ({channel, puzzle}) => {
        this.publish({
            channel: channel,
            message: JSON.stringify(puzzle)
        })
    }
}

