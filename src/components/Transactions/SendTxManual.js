
import sha256 from 'crypto-js/sha256';
import { useEffect, useState } from 'react';
import Select from 'react-select'
import { selectTheme } from '../Others/Colors';

function SendTxManual({ UTXO, gun, user }) {
    const [ipUTXO, setIpUTXO] = useState([]);
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [fee, setFee] = useState(0);
    const [ipUTXOamount, setIpUTXOamount] = useState(0);
    const [showSendButton, setShowSendButton] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleInputs([])
    }, [amount, fee])

    function handleInputs(e) {
        setIpUTXOamount(0)
        let totalUTXOAmount = 0;
        for (let i = 0; i < e.length; i++) {
            totalUTXOAmount += e[i].amount;
        }
        setIpUTXOamount(totalUTXOAmount)
        if (totalUTXOAmount >= (fee + amount) && totalUTXOAmount > 0)
            setShowSendButton(true)
        else
            setShowSendButton(false)
        setIpUTXO(e)
    }

    function calculateMerkleRoot(tx) {
        console.log(tx)
        if (tx.length === 1) {
            return tx
        }
        if (tx.length % 2 !== 0)
            tx.push(tx[tx.length - 1])
        let txTemp = [];
        let i = 0;
        while (i < tx.length - 1) {
            txTemp.push(sha256(tx[i] + tx[i + 1]).toString());
            i += 2;
        }
        calculateMerkleRoot(txTemp)
    }

    async function sendTx(e) {
        e.preventDefault();
        setLoading(true)
        const sender = user.is.pub
        const timestamp = + new Date()
        const ipRoot = await calculateMerkleRoot(ipUTXO);
        let ip = [
            {
                address: sender,
                amount: amount,
                fee: fee
            }
        ]
        ipUTXO.map((val) => {
            ip.push(val)
        })
        let op = [
            {
                address: address,
                amount: amount
            }
        ]
        if (ipUTXOamount > (amount + fee)) {
            op.push({
                address: sender,
                amount: ipUTXOamount - (amount + fee)
            })
        }
        const opRoot = await calculateMerkleRoot(op.map((val, index) => sha256(index + val.hash + val.amount).toString()));
        let tx = {
            hash: sha256(timestamp + amount + fee + ipRoot + opRoot + sender + address).toString(),
            amount: amount,
            fee: fee,
            block: 'mempool',
            from: sender,
            to: address,
            timestamp: timestamp,
            inputs: Object.assign({}, ip),
            outputs: Object.assign({}, op)
        }
        gun.get('mempool').put({
            [tx.hash]: tx
        }).then(() => {
            gun.get('transactions').put({
                [tx.hash]: tx
            }).then(() => console.log('Success'))
        })

    }

    return (
        <form onSubmit={sendTx} className='container'>
            <h4>Send SC</h4>
            <div className='form-field'>
                <label>Address</label>
                <input type='text' value={address}
                    onChange={(e) => setAddress(e.target.value)} required readOnly={loading} />
            </div>
            <div className='form-field'>
                <label>Amount</label>
                <input type='number' value={amount}
                    onChange={(e) => setAmount(+e.target.value)} required readOnly={loading} />
            </div>
            <div className='form-field'>
                <label>Fee</label>
                <input type={'number'} value={fee}
                    onChange={(e) => setFee(+e.target.value)} required readOnly={loading} />
            </div>
            <div className='form-field'
                style={{ display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left' }}>
                <label>Inputs</label>
                <Select theme={selectTheme}
                    isDisabled={loading}
                    value={ipUTXO} onChange={(e) => handleInputs(e)}
                    isMulti
                    className='utxo-list'
                    options={ipUTXOamount >= amount + fee ? [] : Object.keys(UTXO).map((key) => (
                        {
                            hash: key,
                            amount: UTXO[key]
                        }
                    ))}
                    noOptionsMessage={() => (
                        ipUTXOamount >= amount + fee
                            ? 'Required input amount reached'
                            : 'No UTXO found'
                    )}
                    getOptionLabel={e => `${e.hash} : ${e.amount} SC`}
                    getOptionValue={e => e.hash}
                    placeholder='Select inputs' />
            </div>
            <div className='btn-div'>
                {showSendButton && (amount > 0) ?
                    loading ?
                        <div className='loader'></div>
                        : <button>Send</button> :
                    <span style={{ fontSize: 18 }}>Please select inputs to proceed</span>}
            </div>
            <div className='btn-div' style={{ fontSize: 28 }}>
                - Manual method -
            </div>
        </form>
    )
}
export default SendTxManual