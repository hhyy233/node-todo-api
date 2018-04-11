// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connect to MongoDB server');
	
	const db = client.db('TodoApp');// add to v3
	
	// deleteMany
	// db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
		// console.log(result);
	// });
	
	// deleteOne
	// db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
		// console.log(result);
	// });
	
	// findOneAndDelete, delete and get it back
	// db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
		// console.log(result);
	// });
	
	// Users
	// db.collection('Users').deleteMany({name: 'hh'});
	 
	db.collection('Users').findOneAndDelete({
		_id: new ObjectID('5acd6dd9a6a1ab1924e3f417')
	}).then((result) => {
		console.log(JSON.stringify(result, undefined, 2));
	});
	
	// client.close();
});

