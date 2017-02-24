const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  const seedData = [];

  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBlogData());
  }
  return BlogPost.insertMany(seedData);
}
function generateAuthor() {
  return {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
          };

}
function generateBlogData() {
  return {
    title: faker.name.findName(),
    author: generateAuthor(),
    content: faker.name.findName(),
    date: faker.date.past()
  };
}

function tearDownDb() {
  console.warn('Deleting Database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPost API Resource', function(){

  // this starts the server, seeds the test db and tears it down for each test, then closes the server
  before(function(){
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function(){
    return seedBlogData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function(){
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return all posts', function () {
      let res;
      return chai.request(app)
      .get('/posts')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        console.log('count: ', count);
        res.body.should.have.length.of(count);
      });
    });

    it('should return posts with the right fields', function(){
      // We want to get all posts and make sure they have the right fields
      let resPost; //this variable will be the the post to test against the db
      return chai.request(app)
        .get('/posts')
        .then(function(res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(post => {
            post.should.be.a('object');
            post.should.include.keys('title', 'content', 'author');
          });
          resPost = res.body[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post) {

          resPost.id.should.equal(post.id);
          resPost.title.should.equal(post.title);
          resPost.author.should.equal(`${post.author.firstName} ${post.author.lastName}`);
          resPost.content.should.equal(post.content);
        });
    });
  });

  describe('POST endpoint', function() {
    it('should add a new post to the database', function() {

      const newPost = generateBlogData();

      return chai.request(app)
      .post('/posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('title', 'content', 'author');
        //compare response post to the post we sent
        res.body.title.should.equal(newPost.title);
        res.body.content.should.equal(newPost.content);
        res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
        return BlogPost.findById(res.body.id);
      })
      .then(function(post) {
        post.title.should.equal(newPost.title);
        post.content.should.equal(newPost.content);
      });
    });
  });

  describe('PUT endpoint', function() {
    it('should update a post', function() {
      const newData = {
        title: "crazy new title to update lame old title with",
        content: "new content to replace old content with the put method"
      };

      return BlogPost
        .findOne()
        .exec()
        .then(function (post) {
          newData.id = post.id;
          return chai.request(app)
            .put(`/posts/${post.id}`)
            .send(newData)
        })
        .then(function(res) {
          console.log('res from put request:', res.body);
          res.should.have.status(201);
          return BlogPost.findById(newData.id).exec();
        })
        .then(function(post) {
          post.title.should.equal(newData.title);
          post.content.should.equal(newData.content);
        });
    });
  });

  describe('DELETE endpoint', function() {
    it('should delete the item by id', function() {
      let post;
      return BlogPost
        .findOne()
        .exec()
        .then(function(_post) {
          post = _post;

          return chai.request(app)
            .delete(`/posts/${_post.id}`)
        })
        .then(function(res) {
          res.should.have.status(204);
          return BlogPost
            .findById(post.id)
            .exec()
            })
            .then(function(_post){
              should.not.exist(_post)
            });
    })
  });

});
