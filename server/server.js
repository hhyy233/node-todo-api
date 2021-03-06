require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

var port = process.env.PORT;

app.use(bodyParser.json());// trun body into json object

app.post('/todos', authenticate, (req, res) => {
	// console.log(req.body);
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});
	
	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', authenticate, (req, res) => {
	Todo.find({
		_creator: req.user._id
	}).then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	});
});

// GET /todos/:id 
app.get('/todos/:id', authenticate, (req, res) => {
	// console.log(req);
	// res.send(req.params);
	var id = req.params.id;
	
	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}

		// findById
	Todo.findOne({
			_id: id,
			_creator: req.user.id
		}).then((todo) => {
		if(!todo){
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.delete('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	//validate the id -> not then 404
	if(!ObjectID.isValid(id)){
		return res.status(404).send();
	}
	//remove todo by id
	
	Todo.findOneAndRemove({
			_id: id,
			_creator: req.user._id
		}).then((todo) => {
		if(!todo){
			return res.status(404).send();
		}
		res.status(200).send({todo});
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.patch('/todos/:id', authenticate, (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);
	
	if(!ObjectID.isValid(id)){
		return res.status(404).send('Invalid id');
	}
	
	if(_.isBoolean(body.completed) && body.completed){
		body.completedAt = new Date().getTime();
	}else{
		body.completed = false;
		body.completedAt = null;
	}
	
	Todo.findOneAndUpdate({
			_id: id,
			_creator: req.user._id
		}, {$set: body}, {new: true}).then((todo) => {
		if(!todo){
			return res.status(404).send('Cannot find object');
		}
		res.send({todo});
	}).catch((e)=>{
		res.status(400).send('Error with server');
	})
	
});

// POST /users
app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);
	
	user.save().then((user) => {
		return user.generateAuthToken();
	})
	.then((token) => {
		res.header('x-auth', token).send(user);
	})
	.catch((e) => {
		res.status(400).send(e);
	});
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send(e);
	});
	
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

app.get('/users/me', authenticate, (req, res) => { 
	// wrap the authenticate function so we can use the middleware
	res.send(req.user);
});


app.listen(port, () => {
	console.log(`Started up at port ${port}...`);
});
 

module.exports = {app};




// create an instance
// var newTodo = new Todo({
	// text: 'Cook dinner'
// });

// var newTodo = new Todo({
	// text: 'Sleep',
	// completed: true,
	// completedAt: 55
// });

//save 
// newTodo.save().then((doc) => {
	// // console.log('Save todo', doc);
	// console.log(JSON.stringify(doc, undefined, 2));
// }, (e) => {
	// console.log('Unable to save todo');
// });

// var newUser = new User({
	// email: 'hh@example.com'
// });

// newUser.save().then((doc) => {
	// console.log(doc);
// }, (e) => {
	// console.log(e);
// });



