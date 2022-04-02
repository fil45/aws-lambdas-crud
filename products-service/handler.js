"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const response = (statusCode, body) => {
  const resp = {
    statusCode,
    body: JSON.stringify(body),
  };
  console.log("RESPONSE:", resp);
  return resp;
};

module.exports.addProduct = async (event) => {
  let params = {};
  try {
    params = JSON.parse(event.body);
  } catch {
    return response(400, { message: "Bad params" });
  }

  console.log("PARAMS:", params);
  const { title, price } = params;

  if (!title) {
    return response(400, { message: "Title is not specified" });
  }

  if (!price) {
    return response(400, { message: "Price is not specified" });
  }

  const product = {
    id: uuid.v4(),
    title,
    price,
    updatedAt: new Date().getTime(),
  };

  const query = {
    TableName: process.env.PRODUCTS_TABLE,
    Item: product,
  };

  try {
    await dynamoDb.put(query).promise();
    return response(200, product);
  } catch (e) {
    response(500, { message: e.message });
  }
};

module.exports.getAllProducts = async (event) => {
  const query = {
    TableName: process.env.PRODUCTS_TABLE,
    ProjectionExpression: "id, title, price, updatedAt",
  };

  try {
    const { Items: result } = await dynamoDb.scan(query).promise();
    return response(200, result);
  } catch (e) {
    response(500, { message: e.message });
  }
};

module.exports.getProduct = async (event) => {
  const id = event.pathParameters.id;

  const query = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: { id },
  };

  try {
    const { Item: result } = await dynamoDb.get(query).promise();
    return response(200, result);
  } catch (e) {
    response(500, { message: e.message });
  }
};

module.exports.updateProduct = async (event) => {
  const id = event.pathParameters.id;

  let params = {};
  try {
    params = JSON.parse(event.body);
  } catch {
    return response(400, { message: "Bad params" });
  }

  console.log("PARAMS:", params);

  const { title, price } = params;

  const query = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: { id },
    UpdateExpression: 'set title = :title, price = :price',
    ExpressionAttributeValues: {
      ':title' : title,
      ':price' : price,
    }
  };

  const getQuery = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: { id },
  };

  try {
    await dynamoDb.update(query).promise();
    const { Item: result } = await dynamoDb.get(getQuery).promise();
    return response(200, result);
  } catch (e) {
    response(500, { message: e.message });
  }
};

module.exports.deleteProduct = async (event) => {
  const id = event.pathParameters.id;

  const query = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: { id },
  };

  try {
    await dynamoDb.delete(query).promise();
    return response(200, { id });
  } catch (e) {
    response(500, { message: e.message });
  }
};
