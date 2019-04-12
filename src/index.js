import express from 'express'
import Binance from 'node-binance-api'
import socket from 'socket.io'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import knex from 'knex'

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
app.use(helmet())
app.use(express.static('public'))

const server = app.listen(process.env.PORT, () =>
	// eslint-disable-next-line no-console
	console.log(`app listening on port ${process.env.PORT}!`)
)

const io = socket(server)

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		port: 5432,
		database: 'postgres',
		user: 'postgres',
		password: process.env.PASSWORD,
	},
})

binance.websockets.prevDay(false, (error, res) => {
	const pair = res.symbol
	let dataPoint = {}
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
			dataPoint = data.binance[element.market + '_markets'][pair]

			return true
		}
	})
	if (!found) {
		data.binance.usd_markets[res.symbol] = res
		dataPoint = res
	}
	db('binance_data')
		.select('data')
		.where({ pair })
		.then(res => {
			console.log(res)
			if (res.length) {
				db('binance_data')
					.where({ pair })
					.update({ data: JSON.stringify([dataPoint]) })
					.catch(err => {
						console.log(err)
					})
			} else {
				db('binance_data')
					.insert({ pair, dataPoint: JSON.stringify([dataPoint]) })
					.catch(err => {
						console.log(err)
					})
			}
		})
		.catch(err => {
			console.log(err)
		})
})

setInterval(() => {
	io.emit('data', data)
}, 1500)
