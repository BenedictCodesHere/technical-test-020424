import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../function/index';
import { JsonableValue } from 'ts-jest';

describe('Handler', () => {
  // Mock DynamoDB client
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    // Resets the mock before each test suite
    ddbMock.reset();
  });

  // Clean up after all tests in this suite are done
  afterEach(() => {
    ddbMock.restore();
  });

  it('should get all items', async () => {
    // Define the expected items to be returned by the ScanCommand; can also return empty array in the case there are no items
    const items: { id: string; data: string; }[] = [];


    // Mock the ScanCommand to return predefined items
    ddbMock.on(ScanCommand).resolves({
      Items: items,
    });

    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      path: '/items',
      body: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {
        accountId: '',
        apiId: '',
        authorizer: null,
        protocol: 'HTTP',
        httpMethod: 'GET',
        identity: {
          accessKey: null,
          accountId: null,
          apiKey: null,
          apiKeyId: null,
          caller: null,
          clientCert: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          sourceIp: '',
          user: null,
          userAgent: null,
          userArn: null,
        },
        path: '/items',
        stage: '',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: '/items',
      },
      resource: '',
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(items);
  });

  // Additional tests for getItem, createItem, updateItem, and deleteItem
  // would follow a similar structure, with adjustments for the specific
  // command being mocked and the expected outcomes.

  // Example for mocking GetCommand, PutCommand, UpdateCommand, and DeleteCommand
  // would be added here, following the pattern established in the first test case.

  it('should create an item with id and data keys', async () => {
    // Assuming item should be an object, not an array
const item = { id: '1', data: 'test data' };

// Correct mock setup for a PUT operation, assuming you want to test success
ddbMock.on(PutCommand, {
  TableName: expect.anything(),
  Item: expect.anything()
}).resolves({});

// Adjusted event for a POST operation
const event: APIGatewayProxyEvent = {
  httpMethod: 'POST',
  path: '/items',
  body: JSON.stringify(item),
  headers: {},
  multiValueHeaders: {},
  isBase64Encoded: false,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '',
    apiId: '',
    authorizer: null,
    protocol: 'HTTP',
    httpMethod: 'POST',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
      userArn: null,
    },
    path: '/items',
    stage: '',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '/items',
  },
  resource: '',
};

// Calling the handler with the corrected event
const result = await handler(event);

// Checking for a 201 status code, assuming your handler returns 201 for successful item creation
expect(result.statusCode).toBe(201);
// Optionally, you can check if the body contains the item ID if your implementation returns it
expect(JSON.parse(result.body)).toHaveProperty('id', item.id);
expect(JSON.parse(result.body)).toHaveProperty('data', item.data);
  });

});
