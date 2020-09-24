const mongoose = require ('mongoose')

const avatarSchema = new mongoose.Schema ({
	url : {
		type : String,
		required : true,
		unique : true
	}
})

const avatarStore = mongoose.model ('avatarStore', avatarSchema)

module.exports = avatarStore