import {create} from 'ipfs'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'


function repo() {
    return "ipfs/pubsub-nocoin" + Math.random()
}

export class IPFS {
    constructor ({blockchain, transaction_pool, puzzle_pool}) {
        this.blockchain = blockchain
        this.transaction_pool = transaction_pool
        this.puzzle_pool = puzzle_pool
        this.node = null
    }

    create_node = async () => {
        const ipfs_node = await create({
            repo: repo(),
            EXPERIMENTAL: {
                pubsub: true
            }
        })
        this.node = ipfs_node
        return ipfs_node
    }

    handle_message = (message) => {
        console.log("Message received", message)

        const parsed_msg = JSON.parse(uint8ArrayToString(message.data))

        console.log(`-----msg-1----.  Message: ${parsed_msg}.`)




        if (message.topic == 'BLOCKCHAIN') {
            this.blockchain.replace_chain(parsed_msg, () => {
                this.transaction_pool.clear_blockchain_transactions({ chain: parsed_msg})
            })
        } else if (message.topic == 'TRANSACTION') {
         
            this.transaction_pool.set_transaction(parsed_msg)
        } else if (message.topic == 'PUZZLE') {
         
            this.puzzle_pool.set_puzzle(parsed_msg)
        }
    }


    subscribe_topic =  async (topic) => {
        await this.node.pubsub.subscribe(topic, this.handle_message)
        console.log(`subscribed to ${topic}`)
    }
    unsubscribe_topic =  async (topic) => {
        await this.node.pubsub.unsubscribe(topic, this.handle_message)
    }
    publish = async ({topic, message}) => {
        console.log("-----topic----", topic)

        await this.node.pubsub.publish(topic, uint8ArrayFromString(message))
        // msg was broadcasted
        console.log(`published to ${topic}`)

    }

    broadcast_chain = (topic) => {
        this.publish({
            topic: topic,
            message: Buffer.from(JSON.stringify(this.blockchain.chain))
        })
    }
    broadcast_transaction = ({topic, transaction}) => {
        this.publish({
            topic: topic,
            message: Buffer.from(JSON.stringify(transaction))
        })
    }
    broadcast_puzzle = ({topic, puzzle}) => {
        console.log("broadcasting puzzle")
        this.publish({
            topic: topic,
            message: Buffer.from(JSON.stringify(puzzle))
        })
    }
}

