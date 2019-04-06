import express from 'express'
import Binance from 'node-binance-api'
import cors from 'cors'

const binance = Binance()

const app = express()

app.use(cors())

app.get('/', (req, res) => {
	binance.prevDay(false, (error, prevDay) => {
		res.send(JSON.stringify(prevDay))
	})
})

// eslint-disable-next-line no-console
app.listen(3000, () => console.log('Example app listening on port 3000!'))
