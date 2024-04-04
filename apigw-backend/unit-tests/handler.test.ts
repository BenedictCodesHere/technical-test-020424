// UNIT TEST SUITE

// Import AWS SDK v3 DynamoDB client and commands
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../function/index';

// Create a mock DynamoDB client
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.MOCK_DYNAMODB = 'true';
    process.env.TABLE_NAME = 'techtest-table-020424';
  });

  // Test the getItems function
  it('should get all items', async () => {
    const items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];

    // Mock the DynamoDB send method to return a successful response with sample items
    ddbMock.on(ScanCommand).resolves({ Items: items });

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

  // Test the getItem function
  it('should get an item by ID', async () => {
    const item = { id: '1', name: 'Item 1' };

    // Mock the DynamoDB send method to return a successful response with the item
    ddbMock.on(GetCommand).resolves({ Item: item });

    const event: APIGatewayProxyEvent = {
      httpMethod: 'GET',
      path: '/items/1',
      body: null,
      headers: {},
      multiValueHeaders: {},
      isBase64Encoded: false,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: { id: '1' },
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
        path: '/items/1',
        stage: '',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: '/items/{id}',
      },
      resource: '',
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(item);
  });

  // Add more test cases for createItem, updateItem, and deleteItem functions
});