const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cate = new Schema({
    name: {type: String}
})

module.exports = mongoose.model('cate', Cate)