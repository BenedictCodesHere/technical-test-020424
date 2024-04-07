import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../function/index'; // Adjust the import path to your actual Lambda handler file
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  ddbMock.reset();
});

describe('Lambda Function handler', () => {
  it('handles GET /items (Scan)', async () => {
    const items = [{ id: '1', data: 'test' }];
    ddbMock.on(ScanCommand).resolves({ Items: items });

    const event: Partial<APIGatewayProxyEvent> = { httpMethod: 'GET', path: '/items' };
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify(items));
  });

  it('handles GET /items/{id} (Get)', async () => {
    const item = { id: '1', data: 'test' };
    ddbMock.on(GetCommand, { TableName: expect.any(String), Key: { id: '1' } }).resolves({ Item: item });

    const event: Partial<APIGatewayProxyEvent> = { httpMethod: 'GET', path: '/items/1' };
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify(item));
  });

  it('handles POST /items (Put)', async () => {
    ddbMock.on(PutCommand, { TableName: expect.any(String), Item: expect.any(Object) }).resolves({});

    const event: Partial<APIGatewayProxyEvent> = { httpMethod: 'POST', path: '/items', body: JSON.stringify({ id: '2', data: 'test post' }) };
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    expect(result.body).toEqual(event.body);
  });

  it('handles PUT /items/{id} (Update)', async () => {
    const updatedItem = { id: '1', data: 'updated test' };
    ddbMock.on(UpdateCommand, {
      TableName: expect.any(String),
      Key: { id: '1' },
      UpdateExpression: expect.any(String),
      ExpressionAttributeNames: expect.any(Object),
      ExpressionAttributeValues: expect.any(Object),
    }).resolves({});

    const event: Partial<APIGatewayProxyEvent> = { httpMethod: 'PUT', path: '/items/1', body: JSON.stringify({ data: 'updated test' }) };
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify(updatedItem));
  });

  it('handles DELETE /items/{id} (Delete)', async () => {
    ddbMock.on(DeleteCommand, { TableName: expect.any(String), Key: { id: '1' } }).resolves({});

    const event: Partial<APIGatewayProxyEvent> = { httpMethod: 'DELETE', path: '/items/1' };
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(204);
    expect(result.body).toEqual('');
  });
});
