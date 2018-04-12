const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5acf801ad1ebc7281b3af3c5555';

// if(!ObjectID.isValid(id)){
	// return console.log('Id not valid');
// }

// Todos database

// Todo.find({
	// _id: id
// }).then((todos) => {
	// console.log('Todos', todos);
// });

// Todo.findOne({
	// _id: id
// }).then((todo) => {
	// console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
	// if(!todo) {
		// return console.log('Id not found');
	// }
	// console.log('Todo By Id', todo);
// }).catch((e) => {
	// console.log(e); // invalid id
// });


// users database
User.findById('5acf67949a70fcf017a3311c').then((user) => {
	if(!user){
		return console.log('Unable to find user');
	}
	console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
	console.log(e);
});

