import Gun from 'gun'
import { PEERS } from '../Others/Peers';
require('gun/sea')

const gun = Gun({
    peers: PEERS
})
const firstTX = 100;

async function getAddressUTXO(address) {
    // gun.get('UTXO').put({
    //     'tx-1': {
    //         hash: 'tx-1',
    //         address1: 200,
    //         address2: 10,
    //     }
    // })
    const rUTXO = gun.get('UTXO').then((data) => {
        if (!data) {
            return [{
            }, 0]
        }
        else {
            let totalAmount = 0;
            let utxo = {};
            Object.keys(data).map((tx) => {
                if (tx !== '_') {
                    gun.get(`UTXO/${tx}`).get(address).once((myTx) => {
                        if (myTx) {
                            utxo[tx] = myTx;
                            totalAmount += myTx;
                        }
                    })
                }
            })
            return [utxo, totalAmount]
        }
    })
    return rUTXO
}

async function putUTXO(hash, outputs) {
    let utxo = {
        hash: hash
    }
    Object.keys(outputs).map((key) => {
        utxo[outputs[key].address] = outputs[key].amount;
    })
    console.log(utxo)
    const rUTXO = gun.get('UTXO').put({
        [hash]: utxo
    }).then(() => { return true })
    return rUTXO
}

async function deleteUTXO(hash, inputs) {
    let utxo = {
        hash: hash
    }
    Object.keys(inputs).map((key) => {
        utxo[inputs[key].address] = null;
    })
    console.log(utxo)
    const rUTXO = gun.get('UTXO').put({
        [hash]: utxo
    }).then(() => { return true })
    return rUTXO
}

export { getAddressUTXO, putUTXO, deleteUTXO }