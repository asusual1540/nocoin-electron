import { default as EC } from 'elliptic';
import {crypto_hash} from './crypto_hash.js'


export const ec = new EC.ec('secp256k1')

export const verify_signature = ({public_key, data, signature}) => {
    const key_from_public = ec.keyFromPublic(public_key, 'hex')
    return key_from_public.verify(crypto_hash(data), signature)
}
