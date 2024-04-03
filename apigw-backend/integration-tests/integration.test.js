const AWS = require('aws-sdk');
const axios = require('axios');


const cloudformation = new AWS.CloudFormation();
const dynamodb = new AWS.DynamoDB.DocumentClient();

let apiUrl;

describe('API Integration Tests', () => {
  let itemId;

  beforeAll(async () => {
    const stackName = process.env.STACK_NAME;
    const result = await cloudformation.describeStacks({ StackName: stackName }).promise();
    const outputs = result.Stacks[0].Outputs;
    const apiUrlOutput = outputs.find(output => output.OutputKey === 'ApiUrl');
    apiUrl = apiUrlOutput.OutputValue;
    console.log("apiUrl", apiUrl)
  });

  it('should create a new item', async () => {
    const item = { name: 'Test Item' };
    const response = await axios.post(apiUrl, item);
    expect(response.status).toBe(201);
    expect(response.data.name).toBe(item.name);
    itemId = response.data.id;
  });

  it('should get all items', async () => {
    const response = await axios.get(apiUrl);
    expect(response.status).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
  });

  it('should get an item by ID', async () => {
    const response = await axios.get(`${apiUrl}/${itemId}`);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(itemId);
  });

  it('should update an item', async () => {
    const updatedItem = { name: 'Updated Item' };
    const response = await axios.put(`${apiUrl}/${itemId}`, updatedItem);
    expect(response.status).toBe(200);
    expect(response.data.name).toBe(updatedItem.name);
  });

  it('should delete an item', async () => {
    const response = await axios.delete(`${apiUrl}/${itemId}`);
    expect(response.status).toBe(204);
    const deletedItem = await dynamodb.get({ TableName: 'your-table-name', Key: { id: itemId } }).promise();
    expect(deletedItem.Item).toBeUndefined();
  });
});