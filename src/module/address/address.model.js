const mongoose = require('mongoose')
const Schema = mongoose.Schema
const AddressSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
    fullName: {type: String, default: ""},
    addressDetail: {type: String},
    phone_number: {type: String},
    is_default: {type: Boolean, default: false}
})

module.exports = mongoose.model('Address', AddressSchema)


/**
 * @swagger
 * components:
 *   schemas:
 *     address:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           format: ObjectId
 *         fullName:
 *           type: string
 *           default: ""
 *         addressDetail:
 *           type: string
 *           default: 0
 *         phone_number:
 *           type: string
 *           default: 0
 *         is_default:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
