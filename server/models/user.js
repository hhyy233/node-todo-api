const {mongoose} = require('../db/mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
	var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
	
	user.tokens = user.tokens.concat([{access, token}]);
	
	return user.save().then(() => {
		return token;// ?? why it is a promise and we can use chain function 
	});
};

UserSchema.methods.removeToken = function (token) {
	var user = this;
	return user.update({
		$pull: {
			tokens:{
				token: token
			}
		}
	});
};

//model method
UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
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

UserSchema.statics.findByCredentials = function (email, password) {
	var User = this;
	
	return User.findOne({email}).then((user) => {
		if(!user){
			return Promise.reject();
		}
		
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if(res){
					resolve(user);
				}
				else{
					reject('Illegal password!!');
				}
			});
		});
	});
};

// mongoose middleware
UserSchema.pre('save', function(next) {
	var user = this;
	if(user.isModified('password')){
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	}else{
		next();
	}
	
})

// Users
// email - require, trim it, type string, minlength 1
var User = mongoose.model('User', UserSchema);

module.exports = {User};


