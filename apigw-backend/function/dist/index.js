"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Function to retrieve environment variables
function getEnvVariable(name, defaultValue) {
    const value = process.env[name];
    if (value === undefined) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error(`Environment variable ${name} is not defined`);
    }
    return value;
}
// Initialize DynamoDBDocumentClient
const tableName = getEnvVariable("TABLE_NAME", "techtest-table-020424");
const dynamoDBClient = new client_dynamodb_1.DynamoDBClient({});
const dynamoDb = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoDBClient);
const handler = async (event) => {
    const method = event.httpMethod;
    const path = event.path;
    switch (method) {
        case 'GET':
            return path === '/items' ? getItems() : getItem(path.split('/')[2]);
        case 'POST':
            return path === '/items' ? createItem(JSON.parse(event.body)) : notFound();
        case 'PUT':
            return path.startsWith('/items/') ? updateItem(path.split('/')[2], JSON.parse(event.body)) : notFound();
        case 'DELETE':
            return path.startsWith('/items/') ? deleteItem(path.split('/')[2]) : notFound();
        default:
            return notFound();
    }
};
exports.handler = handler;
async function getItems() {
    const result = await dynamoDb.send(new lib_dynamodb_1.ScanCommand({ TableName: tableName }));
    return { statusCode: 200, body: JSON.stringify(result.Items) };
}
async function getItem(id) {
    const result = await dynamoDb.send(new lib_dynamodb_1.GetCommand({ TableName: tableName, Key: { id } }));
    return result.Item ?
        { statusCode: 200, body: JSON.stringify(result.Item) } :
        { statusCode: 404, body: JSON.stringify({ message: 'Item not found' }) };
}
async function createItem(item) {
    await dynamoDb.send(new lib_dynamodb_1.PutCommand({ TableName: tableName, Item: item }));
    return { statusCode: 201, body: JSON.stringify(item) };
}
async function updateItem(id, item) {
    await dynamoDb.send(new lib_dynamodb_1.UpdateCommand({
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set #data = :data',
        ExpressionAttributeNames: { '#data': 'data' },
        ExpressionAttributeValues: { ':data': item.data },
    }));
    return { statusCode: 200, body: JSON.stringify(item) };
}
async function deleteItem(id) {
    await dynamoDb.send(new lib_dynamodb_1.DeleteCommand({ TableName: tableName, Key: { id } }));
    return { statusCode: 204, body: '' };
}
function notFound() {
    return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
}
