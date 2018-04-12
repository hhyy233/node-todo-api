// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}
	console.log('Connect to MongoDB server');
	
	const db = client.db('TodoApp');// add to v3
	
	// db.collection('Todos').findOneAndUpdate({
		// _id: new ObjectID('5acd812dff4016b1988e3146')
	// }, {
		// $set: {
			// completed: true
		// }
	// }, {
		// returnOriginal: false
	// }).then((result) => {
		// console.log(result);
	// });
	
	db.collection('Users').findOneAndUpdate({
		_id: 123
	}, {
		$set: {
			name: 'yy'
		},
		$inc : {
			age: 1
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result);
	});
	
	// client.close();
});

