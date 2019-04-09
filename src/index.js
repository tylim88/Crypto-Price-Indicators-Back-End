import express from 'express'
import Binance from 'node-binance-api'
import socket from 'socket.io'
import cors from 'cors'
import compression from 'compression'

const app = express()
const binance = Binance()
const data = {
	binance: {
		bnb_markets: {},
		btc_markets: {},
		alts_markets: {},
		usd_markets: {},
	},
}
app.use(cors())
app.use(compression())

app.use(express.static('public'))

const server = app.listen(process.env.PORT, () =>
	// eslint-disable-next-line no-console
	console.log(`app listening on port ${process.env.PORT}!`)
)

const io = socket(server)

binance.websockets.prevDay(false, (error, res) => {
	const markets = res.symbol
	if (markets.endsWith('BTC')) {
		data.binance.btc_markets[res.symbol] = res
		data.binance.btc_markets[res.symbol].symbol = res.symbol.replace(
			'BTC',
			'/BTC'
		)
	} else if (markets.endsWith('BNB')) {
		data.binance.bnb_markets[res.symbol] = res
		data.binance.bnb_markets[res.symbol].symbol = res.symbol.replace(
			'BNB',
			'/BNB'
		)
	} else if (markets.endsWith('ETH')) {
		data.binance.alts_markets[res.symbol] = res
		data.binance.alts_markets[res.symbol].symbol = res.symbol.replace(
			'ETH',
			'/ETH'
		)
	} else if (markets.endsWith('XRP')) {
		data.binance.alts_markets[res.symbol] = res
		data.binance.alts_markets[res.symbol].symbol = res.symbol.replace(
			'XRP',
			'/XRP'
		)
	} else if (markets.endsWith('USDT')) {
		data.binance.usd_markets[res.symbol] = res
		data.binance.usd_markets[res.symbol].symbol = res.symbol.replace(
			'USDT',
			'/USDT'
		)
	} else if (markets.endsWith('TUSD')) {
		data.binance.usd_markets[res.symbol] = res
		data.binance.usd_markets[res.symbol].symbol = res.symbol.replace(
			'TUSD',
			'/TUSD'
		)
	} else if (markets.endsWith('USDC')) {
		data.binance.usd_markets[res.symbol] = res
		data.binance.usd_markets[res.symbol].symbol = res.symbol.replace(
			'USDC',
			'/USDC'
		)
	} else if (markets.endsWith('USDS')) {
		data.binance.usd_markets[res.symbol] = res
		data.binance.usd_markets[res.symbol].symbol = res.symbol.replace(
			'USDS',
			'/USDS'
		)
	} else if (markets.endsWith('PAX')) {
		data.binance.usd_markets[res.symbol] = res
		data.binance.usd_markets[res.symbol].symbol = res.symbol.replace(
			'PAX',
			'/PAX'
		)
	} else data.binance.usd_markets[res.symbol] = res
})

setInterval(() => {
	io.emit('data', data)
}, 500)
