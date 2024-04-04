import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../function/index';

describe('Handler', () => {
  // Mock DynamoDB client
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeAll(() => {
    // Resets the mock before each test suite
    ddbMock.reset();
  });

  // Clean up after all tests in this suite are done
  afterAll(() => {
    ddbMock.restore();
  });

  it('should get all items', async () => {
    const items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];

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

});
