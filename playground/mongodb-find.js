// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connect to MongoDB server');
	
	const db = client.db('TodoApp');// add to v3
	
	// db.collection('Todos').find({
		// _id: new ObjectID('5acd6c935e01061a5c611dd0')
	// }).toArray().then((docs) => {
		// console.log('Todos');
		// console.log(JSON.stringify(docs, undefined, 2));
	// }, (err) => {
		// console.log('Unable to fetch todos', err);
	// }); // return cursor
	
	// db.collection('Todos').find().count().then((count) => {
		// console.log('Todos count: ' + count);
	// }, (err) => {
		// console.log('Unable to fetch todos', err);
	// }); // return cursor
	
	db.collection('Users').find({name: 'hh'}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 2));
	}, (err) => {
		console.log('Unable to fetch todos', err);
	}); // return cursor
	
	// client.close();
});

