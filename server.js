require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const PORT = process.env.PORT || 4000
const app = express()

// Middleware
app.use(cors())
app.use(morgan('dev'))

// Sequelize Models
const db = require('./models')
const category = db.category
const product = db.product

// Router files

// Routes
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Route working',
  })
  // const error = new Error('it blew up')
  // next(error)
})

app.get('/api/categories', (req, res, next) => {
  console.log(category)
  category
    .findAll({
      include: [{ model: product }],
    })
    .then(categories => {
      res.json({
        categories,
      })
    })
    .catch(error => {
      next(error)
    })
})

app.get('/api/products', (req, res, next) => {
  product
    .findAll({
      include: [{ model: category }],
    })
    .then(products => {
      res.json({
        products,
      })
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/checkout', async (req, res, next) => {
  try {
    return stripe.charge
      .create({
        amount: req.body.amount,
        currency: 'usd',
        source: req.body.tokenId,
        description: 'test payment',
      })
      .then(result => res.status(200).json(result))
  } catch (error) {
    console.warn(next)
    alert('Sorry, an error has occured :(')
  }
})

// --------------------------------------------------------
// OLD SAMPLE CODE
// --------------------------------------------------------
// app.post('/api/checkout', async (req, res, next) => {
//   const lineItems = [
//     req.body
//     // {
//     //   name: 'T-shirt',
//     //   description: 'Comfortable cotton t-shirt',
//     //   images: ['http://lorempixel.com/400/200/'],
//     //   amount: 500,
//     //   currency: 'usd',
//     //   quantity: 1
//     // }
//   ]

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: lineItems,
//       success_url: 'http://localhost:4000/success',
//       cancel_url: 'http://localhost:4000/cancel'
//     })

//     res.json({ session })
//   } catch (error) {
//     next(error)
//   }
// })

app.use(notFound)
app.use(errorHandler)

// eslint-disable-next-line
function notFound(req, res, next) {
  res
    .status(404)
    .send({ error: 'Not found!', status: 404, url: req.originalUrl })
}

// eslint-disable-next-line
function errorHandler(err, req, res, next) {
  console.error('ERROR', err)
  const stack = process.env.NODE_ENV !== 'production' ? err.stack : undefined
  res.status(500).send({ error: err.message, stack, url: req.originalUrl })
}

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`)
})
