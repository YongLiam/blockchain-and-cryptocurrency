import { useEffect, useState } from "react"
import { FaCopy } from 'react-icons/fa'
import { Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { IoMdCube } from 'react-icons/io'
import { colors } from "../Others/Colors";
import { getTDate } from "../Others/GetDate";
import { getLastBlock } from "./GetLastBlock";


function ViewBlock({ gun }) {

    const { bHeight } = useParams()
    const [block, setBlock] = useState({})
    const [blockTx, setBlockTx] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        setBlockTx([])
        setBlock({})
        gun.get(`blockchain/${bHeight}`).once(async (block) => {
            block.confirmations = (await getLastBlock() - block.height) + 1
            setBlock(block)
            if (block)
                gun.get(`blockchain/${bHeight}/transactions`).once((txs) => {
                    Object.keys(txs).map((txHash) => {
                        if (txHash !== '_')
                            gun.get(`blockchain/${bHeight}/transactions/${txHash}`).once((tx) =>
                                setBlockTx(blockTx => [...blockTx, tx])
                            )
                    })
                })
            setLoading(false)
        })
    }, [bHeight])

    const notify = (msg) => toast(`✔️ ${msg} copied!`, {
        position: "top-right",
        autoClose: 1000,
        style: { background: colors.lighter, color: colors.white },
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    return (
        <div style={{ width: '1800px', maxWidth: '90%' }}>
            <ToastContainer />
            {loading ?
                <div></div>
                :
                block ?
                    <>
                        <h4 style={{ textAlign: 'left' }}><IoMdCube color={colors.link} /> Block #{block.height}</h4>
                        <table style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                            <tr><td>Hash</td> <td>{block.hash} <FaCopy
                                onClick={() => {
                                    navigator.clipboard.writeText(block.hash)
                                    notify('Hash')
                                }} /></td></tr>
                            <tr><td>Confirmations</td> <td>{block.confirmations}</td></tr>
                            <tr> <td>Height</td>
                                <td><Link to={`/block/${block.height}`}>#{block.height}</Link></td>
                            </tr>
                            <tr><td>Timestamp</td> <td>{getTDate(new Date(block.timestamp))}</td></tr>
                            <tr><td>Miner</td> <td>{block.miner}</td></tr>
                            <tr><td>Nonce</td> <td>{block.nonce}</td></tr>
                            <tr><td>Difficulty</td> <td>{block.difficulty}</td></tr>
                            <tr><td>Merkle Root</td> <td>{block.merkleRoot}</td></tr>
                            <tr><td>Transactions</td> <td>{block.txCount}</td></tr>
                            <tr><td>Block Reward</td> <td>{block.blockReward} SC</td></tr>
                            <tr><td>Fee Reward</td> <td>{block.feeReward} SC</td></tr>
                        </table>
                        <h4 style={{ textAlign: 'left' }}>Block Transactions</h4>
                        {blockTx.map((transaction, index) => (
                            <table key={index} style={{ textAlign: 'left', background: '#6ba9a8', marginBottom: 20, padding: 10 }}>
                                <tr><td>Hash</td> <td><Link to={`/tx/${transaction.hash}`}>{transaction.hash}</Link> <FaCopy
                                    onClick={() => {
                                        navigator.clipboard.writeText(transaction.hash)
                                        notify('Hash')
                                    }} /></td></tr>
                                <tr><td>Amount</td> <td>{transaction.amount} SC</td></tr>
                                <tr><td>Fee</td> <td>{transaction.fee} SC</td></tr>
                                <tr><td>From</td> <td><Link to={`/address/${transaction.from}`}>{transaction.from}</Link> <FaCopy
                                    onClick={() => {
                                        navigator.clipboard.writeText(transaction.from)
                                        notify('Address')
                                    }} /></td></tr>
                                <tr><td>To</td> <td><Link to={`/address/${transaction.to}`}>{transaction.to}</Link> <FaCopy
                                    onClick={() => {
                                        navigator.clipboard.writeText(transaction.to)
                                        notify('Address')
                                    }} /></td></tr>
                            </table>
                        ))}
                    </>
                    :
                    'Block not found !'
            }
        </div>
    )
}
export default ViewBlock