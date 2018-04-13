const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

const somesecret = '123abc';

var data = {
	id: 99
};

var token = jwt.sign(data, somesecret);
console.log(token);

var decoded = jwt.verify(token, somesecret);
console.log('decoded', decoded);




// var message = 'I am user number 4';
// var hash = SHA256(message).toString(); //convert object to string

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
	// id: 4
// };
// var token = {
	// data,
	// hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };

// token.data.id = 4;
// token.hash = SHA256(JSON.stringify(data)).toString();

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if(resultHash === token.hash){
	// console.log('Data was not changed');
// }else{
	// console.log('Data was changed. Do not trust!');
// }
