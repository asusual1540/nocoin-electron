import crypto from 'crypto'

export const crypto_hash = (...inputs) => {
    const hash = crypto.createHash('sha256')
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '))
    return hash.digest('hex')
}

