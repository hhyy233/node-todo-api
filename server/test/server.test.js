const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');

const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test todo test';
		
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				
				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((e) => {
					done(e);
				});
				
			});
		
	});
	
	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({})
			.expect(400)
			.end((err, res) => {
				if(err){
					return done(err);
				}
				
				Todo.find().then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((e) => done(e));
			});
	});
	
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1);
			})
			.end(done); 
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});
	
	it('should not return todo doc created by other user', (done) => {
		request(app)
			.get(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	it('should return 404 if todo not found', (done) => {
		var id = new ObjectID();
		request(app)
			.get(`/todos/${id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/todos/123')
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		var hexId = todos[1]._id.toHexString();
		
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(hexId);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}
				// query database using findById
				Todo.findById(hexId).then((todo) => {
					expect(todo).toBeFalsy();
					done();
				}).catch((e) => {
					done(e);
				});
			});
	});
	
	it('should not remove a todo that created by other user', (done) => {
		var hexId = todos[0]._id.toHexString();
		
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.end((err, res) => {
				if(err){
					return done(err);
				}
				// query database using findById
				Todo.findById(hexId).then((todo) => {
					expect(todo).toBeTruthy();
					done();
				}).catch((e) => {
					done(e);
				});
			});
	});
	
	it('should return 404 if todo not found', (done) => {
		var id = new ObjectID();
		request(app)
			.delete(`/todos/${id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
	
	it('should return 404 if object id is invalid', (done) => {
		request(app)
			.delete(`/todos/123`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('PATCH /todos/:id', () =>{
	it('should update the todo', (done) => {
		var hexId = todos[0]._id.toHexString();
		var body = {
			text: "Update text",
			completed: true
		};
		
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.send(body)
			.expect(200)
			.expect((res) => {
				// expect(res.body).toExist();
				expect(res.body.todo.text).toBe(body.text);
				expect(res.body.todo.completed).toBe(true);
				// expect(res.body.todo.completedAt).toBeA('number');
				expect(typeof res.body.todo.completedAt).toBe('number');
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				}
				
				Todo.findById(hexId).then((todo) => {
					expect(todo.text).toBe(body.text);
					expect(todo.completed).toBe(true);
					// expect(todo.completedAt).toBeA('number');
					expect(typeof todo.completedAt).toBe('number');
					done();
				}).catch((e) => {
					done(e);
				});
			});
	});
	
	it('should not update the todo created by other user', (done) => {
		var hexId = todos[1]._id.toHexString();
		var body = {
			text: "Update text",
			completed: true
		};
		
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.send(body)
			.expect(404)
			.end(done);
	});
	
	it('should clear completedAt when todo is not completed', (done) => {
		var hexId = todos[1]._id.toHexString();
		var body = {
			text: "Update text 2",
			completed: false
		};
		
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.send(body)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(body.text);
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completedAt).toBeFalsy();
				done();
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				}
				
				Todo.findById(hexId).then((todo) => {
					expect(todo.text).toBe(body.text);
					expect(todo.completed).toEqual(false);
					expect(todo.completedAt).toBeFalsy();
				}).catch((e) => {
					done(e);
				});
			});
		
	});
});

describe('GET /users/me', () => {
	it('should return if authenticated', (done) => {
		request(app)
			.get(`/users/me`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);// ===
			})
			.end(done);
	});
	
	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({}); // .is_equal()
			})
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = 'example@example.com';
		var password = '123mnb!';
		
		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if(err){
					return done(err);
				} 
				
				User.findOne({email}).then((user) => {
					expect(user).toBeTruthy();
					expect(user.password).not.toBe(password);
					done();
				}).catch((e) => done(e));
				
			});
	});
	
	it('should return validation errors if request invalid', (done) => {
		var email = 'faegesg';
		var password = 'ge';
		
		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.expect((res) => {
				expect(res.body.message).toBeTruthy();
			})
			.end(done);
	});
	
	it('should no create user if email in use', (done) => {
		var email = 'daf@mail.com';
		var password = 'geagaagag';
		
		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done);
	});
	
});

describe('POST /users/login', () => {
	it('should login user and return auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: users[1].password
			})
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}
				
				User.findById(users[1]._id).then((user) => {
					expect(user.toObject().tokens[1]).toMatchObject({
						access:'auth',
						token: res.headers['x-auth']
					});
					done();
				}).catch((e) => done(e));
			});
	});
	
	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[1].email,
				password: '132135'
			})
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens.length).toBe(1);
					done();
				}).catch((e) => done(e));
			});
	});
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if(err){
					return done(err);
				}
				User.findById(users[0]._id).then((user) => {
					expect(user.tokens.length).toBe(0);
					done()
				}).catch((e) => done(e));
			});
	});
});


