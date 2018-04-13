const {User} = require('../models/user');

var authenticate = (req, res, next) => { // middleware
	var token = req.header('x-auth');
	
	User.findByToken(token).then((user) => {
		if(!user){
			return Promise.reject();// auto stop and go into the error case
		}
		
		req.user = user;
		req.token = token;
		next();
	}).catch((e) => {
		res.status(401).send();
	});
};

module.exports = {authenticate};

