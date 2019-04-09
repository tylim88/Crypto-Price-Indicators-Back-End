'use strict'

var _express = _interopRequireDefault(require('express'))

var _nodeBinanceApi = _interopRequireDefault(require('node-binance-api'))

var _socket = _interopRequireDefault(require('socket.io'))

var _cors = _interopRequireDefault(require('cors'))

var _compression = _interopRequireDefault(require('compression'))

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { default: obj }
}

var app = (0, _express['default'])()
var binance = (0, _nodeBinanceApi['default'])()
var data = {
	binance: {
		bnb_markets: {},
		btc_markets: {},
		alts_markets: {},
		usd_markets: {},
	},
}
app.use((0, _cors['default'])())
app.use((0, _compression['default'])())
app.use(_express['default']['static']('public'))
var server = app.listen(process.env.PORT, function() {
	return (
		// eslint-disable-next-line no-console
		console.log('app listening on port '.concat(process.env.PORT, '!'))
	)
})
var io = (0, _socket['default'])(server)
binance.websockets.prevDay(false, function(error, res) {
	var markets = res.symbol

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
setInterval(function() {
	io.emit('data', data)
}, 500)
