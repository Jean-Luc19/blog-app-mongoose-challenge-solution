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
  return
    {firstName: faker.name.firstName(), lastName: faker.name.lastName()};

}
function generateBlogData() {
  return {
    title: faker.lorum.sentence(),
    author: generateAuthor(),
    content: faker.lorum.paragraph(),
    date: faker.date.past();
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
    return seedBlogData(),
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function(){
    return closeServer();
  });

  describe('GET endpoint', function() {
    it('should return all posts'. function () {
      let res;
      return chai.request(app)
      .get('/posts')
      .then(function (_res) {
        res = _res;
        res.should.have.status(200);
        res.body.posts.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.posts.should.have.length.of(count);
      });
    });
  });

})
