var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());// trun body into json object

app.post('/todos', (req, res) => {
	// console.log(req.body);
	var todo = new Todo({
		text: req.body.text
	});
	
	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({
			todos
		});
	}, (e) => {
		res.status(400).send(e);
	});
});

app.listen(3000, () => {
	console.log('Started on port 3000...');
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



