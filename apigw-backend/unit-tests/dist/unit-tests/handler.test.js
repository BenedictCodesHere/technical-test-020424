"use strict";
// UNIT TEST SUITE
Object.defineProperty(exports, "__esModule", { value: true });
//  Imports
const aws_sdk_client_mock_1 = require("aws-sdk-client-mock");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const index_1 = require("../function/index");
// Test the getItem function:
// Mock the DynamoDB get operation to return a successful response with a sample item.
// Invoke the getItem function with a valid item ID and verify that it returns the expected item.
// Mock the DynamoDB get operation to return an empty response (item not found).
// Invoke the getItem function with a non-existent item ID and verify that it returns a 404 error.
// Test the createItem function:
//     Mock the DynamoDB put operation to return a successful response.
//     Invoke the createItem function with a sample item and verify that it returns the created item.
// Test the updateItem function:
// Mock the DynamoDB update operation to return a successful response.
// Invoke the updateItem function with a valid item ID and updated data, and verify that it returns the updated item.
// Test the deleteItem function:
// Mock the DynamoDB delete operation to return a successful response.
// Invoke the deleteItem function with a valid item ID and verify that it returns a 204 status code.
const ddbMock = (0, aws_sdk_client_mock_1.mockClient)(lib_dynamodb_1.DynamoDBDocumentClient);
describe('Handler', () => {
    beforeEach(() => {
        ddbMock.reset();
        process.env.TABLE_NAME = 'techtest-table-020424';
    });
    // Test the getItems function:
    it('should get all items', async () => {
        const items = [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }];
        // Mock the DynamoDB scan operation to return a successful response with sample items.
        ddbMock.on(lib_dynamodb_1.ScanCommand).resolves({ Items: items });
        const event = {
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
        // Invoke the getItems function and verify that it returns the expected items.
        const result = await (0, index_1.handler)(event);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(items);
    });
    // Add more test cases for getItem, createItem, updateItem, and deleteItem functions
    // Example test case for getItem function
    it('should get an item by ID', async () => {
        const item = { id: '1', name: 'Item 1' };
        ddbMock.on(lib_dynamodb_1.GetCommand).resolves({ Item: item });
        const event = {
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
        const result = await (0, index_1.handler)(event);
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(item);
    });
    // ...
});
