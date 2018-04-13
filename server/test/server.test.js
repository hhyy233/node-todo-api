const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {ObjectID} = require('mongodb');

const todos = [{
	_id: new ObjectID(),
	text: 'First test todo'
}, {
	_id: new ObjectID(),
	text: 'Second test todo',
	completed: true,
	completedAt: 666
}];

beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => done());
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test todo test';
		
		request(app)
			.post('/todos')
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
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done); 
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});
	
	it('should return 404 if todo not found', (done) => {
		var id = new ObjectID();
		request(app)
			.get(`/todos/${id.toHexString()}`)
			.expect(404)
			.end(done);
	});
	
	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/todos/123')
			.expect(404)
			.end(done);
	});
	
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		var hexId = todos[1]._id.toHexString();
		
		request(app)
			.delete(`/todos/${hexId}`)
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
					expect(todo).toNotExist();
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
			.expect(404)
			.end(done);
	});
	
	it('should return 404 if object id is invalid', (done) => {
		request(app)
			.delete(`/todos/123`)
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
			.send(body)
			.expect(200)
			.expect((res) => {
				// expect(res.body).toExist();
				expect(res.body.todo.text).toBe(body.text);
				expect(res.body.todo.completed).toEqual(true);
				expect(res.body.todo.completedAt).toBeA('number');
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				}
				
				Todo.findById(hexId).then((todo) => {
					expect(todo.text).toBe(body.text);
					expect(todo.completed).toEqual(true);
					expect(todo.completedAt).toBeA('number');
					done();
				}).catch((e) => {
					done(e);
				});
			});
	});
	
	it('should clear completedAt when todo is not completed', (done) => {
		var hexId = todos[1]._id.toHexString();
		var body = {
			text: "Update text 2",
			completed: false
		};
		
		request(app)
			.patch(`/todos/${hexId}`)
			.send(body)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(body.text);
				expect(res.body.todo.completed).toEqual(false);
				expect(res.body.todo.completedAt).toNotExist();
				done();
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				}
				
				Todo.findById(hexId).then((todo) => {
					expect(todo.text).toBe(body.text);
					expect(todo.completed).toEqual(false);
					expect(todo.completedAt).toNotExist();
				}).catch((e) => {
					done(e);
				});
			});
		
	});
});



