"use strict";
/*
The handler function acts as the main entry point and handles the routing based on the HTTP method and path.
The getItems, getItem, createItem, updateItem, and deleteItem functions perform the corresponding CRUD operations on the DynamoDB table.
The APIGatewayProxyEvent and APIGatewayProxyResult types from the aws-lambda module are used to define the event and response shapes.
The DynamoDB.DocumentClient is used to interact with DynamoDB using a simplified API.
Make sure to compile this TypeScript code to JavaScript before deploying the Lambda function.

Also, note that the TABLE_NAME environment variable is assumed to be set with the name of the DynamoDB table. You can set it in the Lambda function's environment variables or pass it through the CloudFormation template.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
function getEnvVariable(name) {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}
const tableName = getEnvVariable("TABLE_NAME");
const dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient();
const handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path;
    switch (method) {
        case 'GET':
            if (path === '/items') {
                return getItems();
            }
            else if (path.startsWith('/items/')) {
                const id = path.split('/')[2];
                return getItem(id);
            }
            break;
        case 'POST':
            if (path === '/items') {
                const item = JSON.parse(event.body);
                return createItem(item);
            }
            break;
        case 'PUT':
            if (path.startsWith('/items/')) {
                const id = path.split('/')[2];
                const item = JSON.parse(event.body);
                return updateItem(id, item);
            }
            break;
        case 'DELETE':
            if (path.startsWith('/items/')) {
                const id = path.split('/')[2];
                return deleteItem(id);
            }
            break;
    }
    return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' }),
    };
};
exports.handler = handler;
async function getItems() {
    const result = await dynamoDb.scan({ TableName: tableName }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(result.Items),
    };
}
async function getItem(id) {
    const result = await dynamoDb.get({ TableName: tableName, Key: { id } }).promise();
    if (result.Item) {
        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    }
    else {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'Item not found' }),
        };
    }
}
async function createItem(item) {
    await dynamoDb.put({ TableName: tableName, Item: item }).promise();
    return {
        statusCode: 201,
        body: JSON.stringify(item),
    };
}
async function updateItem(id, item) {
    await dynamoDb.update({
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': item.data },
    }).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(item),
    };
}
async function deleteItem(id) {
    await dynamoDb.delete({ TableName: tableName, Key: { id } }).promise();
    return {
        statusCode: 204,
        body: '',
    };
}
