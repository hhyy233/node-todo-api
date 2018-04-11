// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

// var user = {name: 'hh', age:20};
// var {name} = user; //destructure
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connect to MongoDB server');
	
	const db = client.db('TodoApp');// add to v3
	
	// db.collection('Todos').insertOne({
		// text: 'Something',
		// completed: false
	// }, (er, result) => {
		// if(err){
			// return console.log('Unable to insert todo', err);
		// }
		
		// console.log(JSON.stringify(result.ops, undefined, 2));//.ops record all the data we have been inserted.
	// }); //create the collection
	
	// Insert new doc into Users(name, age, location)
	// db.collection('Users').insertOne({
		// name: 'hh',
		// age: 20,
		// location: 'ny'
	// }, (err, result) => {
		// if(err){
			// return console.log('Unable to insert Users', err);
		// }
		// // console.log(JSON.stringify(result.ops, undefined, 2));
		// console.log(result.ops[0]._id.getTimestamp());
	// });
	
	// db.close();
	client.close();
});