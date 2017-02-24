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

function tearDownDb
