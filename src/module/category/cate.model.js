const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Cate = new Schema({
    name: {type: String, uniqe: true}
})

module.exports = mongoose.model('cate', Cate)