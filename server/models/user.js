const {mongoose} = require('../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		required: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

// override the funciton to indicate wich properties we want the server to send back
UserSchema.methods.toJSON = function () {
	var user = this;
	var userObject = user.toObject();
	return _.pick(userObject, ['_id', 'email']);
};

// Instance method
UserSchema.methods.generateAuthToken = function () {// we have this keyword
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
	
	user.tokens = user.tokens.concat([{access,token}]);
	
	return user.save().then(() => {
		return token;
	});
};

//model method
UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;
	try {
		decoded = jwt.verify(token, 'abc123');
	} catch (e) {
		// return new Promise((resolve, reject) => {
			// reject();
		// });
		return Promise.reject();// fill out the param will return some info.
	}
	
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
	
};

// Users
// email - require, trim it, type string, minlength 1
var User = mongoose.model('User', UserSchema);

module.exports = {User};