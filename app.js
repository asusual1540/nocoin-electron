import express from "express"
import request from "request"
import bodyParser from "body-parser"
import path from "path"
import cors from 'cors'




import { GENESIS_PUZZLE, TOPICS } from "./config.js"
import { Blockchain } from "./blockchain/index.js"
import { Brain } from "./brain/index.js"
import { TransactionPool } from "./brain/transaction-pool.js"
import { PuzzlePool } from "./brain/puzzle-pool.js"
// import {PubSub} from "./app/pubsub.js"
import { TransactionMiner } from "./app/transaction-miner.js"
import { IPFS } from "./app/ipfs.js"




const __dirname = path.resolve();



export const server = express()
const blockchain = new Blockchain()
const transaction_pool = new TransactionPool()
const puzzle_pool = new PuzzlePool()
const brain = new Brain()
const pubsub = new IPFS({ blockchain, transaction_pool, puzzle_pool })
pubsub.create_node().then(() => {
    pubsub.subscribe_topic(TOPICS['BLOCKCHAIN'])
    pubsub.subscribe_topic(TOPICS['PUZZLE'])
    pubsub.subscribe_topic(TOPICS['TRANSACTION'])
})



const transaction_miner = new TransactionMiner({ blockchain, transaction_pool, puzzle_pool, brain, pubsub })



const DEFAULT_PORT = 5001


const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`

server.use(cors({
    origin: '*'
}));

server.use(bodyParser.json())
server.use(express.static(__dirname + '/public'))

server.get("/blockchain", (req, res) => {
    res.json(blockchain.chain)
})

server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
})

server.post("/mine", (req, res) => {
    const { data } = req.body
    blockchain.add_block(data)
    pubsub.broadcast_chain("BLOCKCHAIN")
    res.redirect("/blockchain")
})

server.get("/transactions", (req, res) => {
    res.json(transaction_pool.transaction_map)
})

server.get("/mine-transactions", (req, res) => {
    transaction_miner.mine_transactions()
    res.redirect("/blockchain")

})

server.post("/wallet/transact", (req, res) => {
    const { amount, recipient } = req.body
    let transaction = transaction_pool.existing_transaction({ input_address: brain.public_key })
    try {
        if (transaction) {
            transaction.update({ sender_brain: brain, recipient, amount })
        } else {
            transaction = brain.create_transaction({ recipient, amount, chain: blockchain.chain })
        }

    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message, transaction: null })
    }

    transaction_pool.set_transaction(transaction)
    pubsub.broadcast_transaction({ topic: "TRANSACTION", transaction })

    res.json({ type: "success", message: "Successfully created the transaction.", transaction })
})
server.post("/puzzle/create", (req, res) => {
    const { value, domain, category, subject, level, difficulty, description, rules, answer, hint } = req.body
    console.log("create puzzle req body", req.body)
    try {
        const puzzle = brain.create_puzzle({ puzzle_map: puzzle_pool.puzzle_map, value, domain, category, subject, level, difficulty, description, rules, answer, hint })
        console.log("puzzle", puzzle)
        console.log("setting puzzle")

        puzzle_pool.set_puzzle(puzzle)
        pubsub.broadcast_puzzle({ topic: "PUZZLE", puzzle })

        res.json({ type: "success", message: "Successfully created the puzzle.", puzzle })
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message, puzzle: null })
    }

})

server.get("/puzzles", (req, res) => {
    if (Object.keys(puzzle_pool.puzzle_map).length == 0) {
        res.json({ '1': GENESIS_PUZZLE })
    } else {
        res.json(puzzle_pool.puzzle_map)

    }
})


server.post("/puzzle/solve", (req, res) => {

    const { puzzle_id, invalid, solution } = req.body
    let _status = invalid ? "invalid" : "valid"

    const result = puzzle_pool.solve_puzzle(brain, puzzle_id, solution, _status)
    pubsub.broadcast_puzzle({ topic: "PUZZLE", puzzle: puzzle_pool.puzzle_map[puzzle_id] })
    console.log("puzzle react", puzzle_pool.puzzle_map[puzzle_id])
    res.json({ type: "success", message: "Successfully solved the puzzle.", result })

})

server.get("/wallet/info", (req, res) => {
    const address = brain.public_key
    res.json({
        address,
        balance: Brain.calculate_balance({ chain: blockchain.chain, address }),
        wisdom: Brain.calculate_wisdom({ puzzle_map: puzzle_pool.puzzle_map, address })
    })
})


const sync_with_root = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/blockchain` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const root_chain = JSON.parse(body)
            console.log("replacing chain with root node", root_chain)
            blockchain.replace_chain(root_chain)
        }
    })

    request({ url: `${ROOT_NODE_ADDRESS}/transactions` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const root_transaction_pool = JSON.parse(body)
            console.log("replacing transaction pool map with root node", root_transaction_pool)
            transaction_pool.set_map(root_transaction_pool)
        }
    })
}

let PEER_PORT

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT

server.listen(PORT, () => {
    console.log(`server listening on port:${PORT}`)
    if (PORT !== DEFAULT_PORT) {
        sync_with_root()
    }
})


