import express from 'express'
import Binance from 'node-binance-api'
import socket from 'socket.io'
import cors from 'cors'

const app = express()
const binance = Binance()
const data = {
	binance: {
		bnb_markets: {},
		btc_markets: {},
		eth_markets: {},
		usd_markets: {},
	},
}
app.use(cors())

const server = app.listen(3001, () =>
	// eslint-disable-next-line no-console
	console.log('app listening on port 3001!')
)

const io = socket(server)

binance.websockets.prevDay(false, (error, res) => {
	const markets = res.symbol.substring(3)
	if (markets.lastIndexOf('BTC') !== -1) {
		data.binance.btc_markets[res.symbol] = res
	} else if (markets.lastIndexOf('BNB') !== -1) {
		data.binance.bnb_markets[res.symbol] = res
	} else if (markets.lastIndexOf('ETH') !== -1) {
		data.binance.eth_markets[res.symbol] = res
	} else {
		data.binance.usd_markets[res.symbol] = res
	}
})

setInterval(() => {
	io.emit('data', data)
}, 5000)
