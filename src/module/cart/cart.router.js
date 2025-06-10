const express = require('express')
const router = express.Router()
const cartContronller = require('./cart.contronller')

// router.post('/addToCart', async(req, res) => {
//     await cartContronller.addToCart(req, res)
// })

//test
router.post('/addToCart', async(req, res) => {
    await cartContronller.addToCart(req, res)
})

router.patch('/updateStatusToFalse/:id', async(req, res) => {
    await cartContronller.updateStatusToFalse(req, res)
})

router.patch('/updateStatusToTrue/:id_cartItem', async(req, res) => {
    await cartContronller.updateStatusToTrue(req, res)
})

router.delete('/deleteCartItem/:cartItemId', async(req, res) => {
    await cartContronller.removeCartItem(req, res)
})

router.patch("/updateQuantity/cartItemId/:id", async(req, res) => {
    await cartContronller.updateCartItemQuantity(req, res)
})

router.get('/getByUserId/:id', async(req, res) => {
    await cartContronller.getByUserId(req, res)
})

// router.delete('/deleteCartItem/:cartItemId', async(req, res) => {
//     await cartContronller.deleteCartItem(req, res)
// })

module.exports = router