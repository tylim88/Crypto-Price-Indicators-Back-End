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

const server = app.listen(process.env.PORT, () =>
	// eslint-disable-next-line no-console
	console.log(`app listening on port ${process.env.PORT}!`)
)

const io = socket(server)

app.use(cors())
app.use(compression())
app.use(helmet())
app.use(express.static('public'))

binance.websockets.prevDay(false, (err, res) => {
	if (err) {
		// eslint-disable-next-line no-console
		console.log(err)
		return
	}
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

io.on('connect', socket => {
	socket.on('room', roomInfo => {
		const { join, pair, period } = roomInfo
		const roomName = `${pair}@${period}`
		const rooms = io.sockets.adapter.rooms
		if (join) {
			socket.join(roomName, err => {
				if (err) {
					// eslint-disable-next-line no-console
					console.log(err)
					return
				}
				if (rooms[roomName].length === 1) {
					binance.websockets.chart(pair, period, (symbol, interval, chart) => {
						if (rooms[roomName]) {
							io.to(roomName).emit(roomName, chart)
						} else {
							const endPoint = `${pair}@kline_${period}`.toLowerCase()
							binance.websockets.terminate(endPoint)
						}
					})
				}
			})
			// console.log(socket.id, 'joined', roomName)
		} else {
			socket.leave(roomName, err => {
				if (err) {
					// eslint-disable-next-line no-console
					console.log(err)
					return
				}
				if (rooms[roomName]) {
					const endPoint = `${pair}@kline_${period}`
					binance.websockets.terminate(endPoint)
				}
			})
			// console.log(socket.id, 'left', roomName)
		}
	})
})
