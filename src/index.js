import express from 'express'
import Binance from 'node-binance-api'
import socket from 'socket.io'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'

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
const binanceChartPeriod = [
	'1m',
	'3m',
	'5m',
	'15m',
	'30m',
	'1h',
	'2h',
	'4h',
	'6h',
	'8h',
	'12h',
	'1d',
	'3d',
	'1w',
	'1M',
]

app.use(cors())
app.use(compression())
app.use(helmet())
app.use(express.static('public'))

const server = app.listen(process.env.PORT, () =>
	// eslint-disable-next-line no-console
	console.log(`app listening on port ${process.env.PORT}!`)
)

const io = socket(server)

binance.websockets.prevDay(false, (error, res) => {
	const pair = res.symbol
	const markets = [
		{ unit: ['BTC'], market: 'btc' },
		{ unit: ['BNB'], market: 'bnb' },
		{ unit: ['ETH', 'XRP'], market: 'alts' },
		{ unit: ['USDT', 'TUSD', 'USDC', 'USDS', 'PAX'], market: 'usd' },
	]

	const found = markets.some(element => {
		const unit = element.unit.find(unit => pair.endsWith(unit))
		if (unit) {
			data.binance[element.market + '_markets'][res.symbol] = res
			data.binance[element.market + '_markets'][
				res.symbol
			].symbol = res.symbol.replace(unit, '/' + unit)
			return true
		}
	})
	if (!found) {
		data.binance.usd_markets[res.symbol] = res
	}
})

setInterval(() => {
	io.emit('data', data)
}, 1500)

binance.prevDay(false, (error, prevDay) => {
	for (let obj of prevDay) {
		const { symbol } = obj
		binanceChartPeriod.forEach(period => {
			const roomName = `${symbol}@${period}`
			const binance = Binance()
			const room = io.sockets.in(roomName)
			room.on('join', function() {
				if (room.clients.length === 1) {
					console.log('Someone joined the room.')
				}
			})
			room.on('leave', function() {
				if (room.clients.length) {
					binance.websockets.terminate(roomName)
					console.log('Someone left the room.')
				}
			})
		})
	}
})
