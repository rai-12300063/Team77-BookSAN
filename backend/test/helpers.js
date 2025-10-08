/**
 * Test Helper Functions
 * Contains utility functions for setting up and running tests
 */

const sinon = require('sinon');

// Create mock HTTP request object
const mockReq = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    user: options.user || null,
    headers: options.headers || {},
    ...options
  };
};

// Create mock HTTP response object with Sinon spies
const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res);
  res.cookie = sinon.stub().returns(res);
  res.clearCookie = sinon.stub().returns(res);
  return res;
};

// Create mock database models with common methods
const createMockModel = (name) => {
  return {
    find: sinon.stub().returnsThis(),
    findOne: sinon.stub().resolves(null),
    findById: sinon.stub().resolves(null),
    create: sinon.stub().resolves({ _id: `new${name}Id` }),
    updateOne: sinon.stub().resolves({ nModified: 1 }),
    findOneAndUpdate: sinon.stub().resolves(null),
    findByIdAndUpdate: sinon.stub().resolves(null),
    findByIdAndDelete: sinon.stub().resolves(null),
    deleteOne: sinon.stub().resolves({ deletedCount: 1 }),
    deleteMany: sinon.stub().resolves({ deletedCount: 5 }),
    countDocuments: sinon.stub().resolves(10),
    sort: sinon.stub().returnsThis(),
    limit: sinon.stub().returnsThis(),
    skip: sinon.stub().returnsThis(),
    populate: sinon.stub().returnsThis(),
    exec: sinon.stub().resolves([])
  };
};

// Create a mock JWT token for authentication tests
const createMockToken = (userId, role) => {
  return `mock-token-${userId}-${role}`;
};

module.exports = {
  mockReq,
  mockRes,
  createMockModel,
  createMockToken
};