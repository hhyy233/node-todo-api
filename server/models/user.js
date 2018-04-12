var {mongoose} = require('../db/mongoose');

// Users
// email - require, trim it, type string, minlength 1
var User = mongoose.model('User', {
	email: {
		type: String,
		trim: true,
		required: true,
		minlength: 1
	}
});

module.exports = {User};