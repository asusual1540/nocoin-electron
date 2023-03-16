import crypto from 'crypto'

export const crypto_hash_puzzle = (...inputs) => {
    console.log("all inputs", ...inputs)
    const hash = crypto.createHash('sha256')
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '))
    return hash.digest('hex')
}

