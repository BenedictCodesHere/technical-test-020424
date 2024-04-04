import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../function/index';

// Mock the DynamoDB Document client
const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
  // Reset the mock before each test to clear previous configurations
  ddbMock.reset();
});

describe('get items', () => {
  it('should retrieve all items', async () => {
    // Setup your mock response
    ddbMock.on(ScanCommand).resolves({
      Items: [{ id: '1', data: 'test data' }],
    });

    // Define the API Gateway event to simulate a GET /items request
    const event = {
      httpMethod: 'GET',
      path: '/items',
      // Other necessary properties omitted for brevity
    };

    // Call your handler function with the mocked event
    const result = await handler(event as any);

    // Assert your expectations
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual([{ id: '1', data: 'test data' }]);

    // Verify that the ScanCommand was called
    // Corrected usage to check for ScanCommand calls
    expect(ddbMock.commandCalls(ScanCommand)).toHaveLength(1);

  });
});
