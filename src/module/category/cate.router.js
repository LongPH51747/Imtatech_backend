const express = require('express')
const router = express.Router()
const cateContronller = require('./cate.contronller')

router.post('/create', cateContronller.create)
router.delete('/delete', cateContronller.delete)
router.get('/get', cateContronller.get)
router.get('/getById/:id', cateContronller.getById)

module.exports = router