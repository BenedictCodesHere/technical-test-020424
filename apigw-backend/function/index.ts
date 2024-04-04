// Import necessary AWS SDK clients and commands
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Function to retrieve environment variables
function getEnvVariable(name: string, defaultValue?: string): string {
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
const dynamoDBClient = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const path = event.path;

  switch (method) {
    case 'GET':
      return path === '/items' ? getItems() : getItem(path.split('/')[2]);
    case 'POST':
      return path === '/items' ? createItem(JSON.parse(event.body!)) : notFound();
    case 'PUT':
      return path.startsWith('/items/') ? updateItem(path.split('/')[2], JSON.parse(event.body!)) : notFound();
    case 'DELETE':
      return path.startsWith('/items/') ? deleteItem(path.split('/')[2]) : notFound();
    default:
      return notFound();
  }
};

async function getItems(): Promise<APIGatewayProxyResult> {
  const result = await dynamoDb.send(new ScanCommand({ TableName: tableName }));
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

async function getItem(id: string): Promise<APIGatewayProxyResult> {
  const result = await dynamoDb.send(new GetCommand({ TableName: tableName, Key: { id } }));
  return result.Item ? 
    { statusCode: 200, body: JSON.stringify(result.Item) } : 
    { statusCode: 404, body: JSON.stringify({ message: 'Item not found' }) };
}

async function createItem(item: any): Promise<APIGatewayProxyResult> {
  await dynamoDb.send(new PutCommand({ TableName: tableName, Item: item }));
  return { statusCode: 201, body: JSON.stringify(item) };
}

async function updateItem(id: string, item: any): Promise<APIGatewayProxyResult> {
  await dynamoDb.send(new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set #data = :data',
    ExpressionAttributeNames: { '#data': 'data' },
    ExpressionAttributeValues: { ':data': item.data },
  }));
  return { statusCode: 200, body: JSON.stringify(item) };
}

async function deleteItem(id: string): Promise<APIGatewayProxyResult> {
  await dynamoDb.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
  return { statusCode: 204, body: '' };
}

function notFound(): APIGatewayProxyResult {
  return { statusCode: 404, body: JSON.stringify({ message: 'Not Found' }) };
}