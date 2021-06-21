import { RequestOptions } from 'undici/types/dispatcher';
import request from '../undiciRequest';

const mockClientRequest = jest.fn();

jest.mock('undici', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return { request: mockClientRequest };
    }),
  };
});

describe('undici request supports multiple content types', () => {
  it('should call undici request with right HTML content type', async () => {
    mockClientRequest.mockImplementation(() => ({
      body: '<html><body>some html</body></html>',
    }));
    await request({
      basePath: 'https://gitbar.com',
      authorization: '',
      method: 'GET',
      path: '/index',
      content: 'HTML',
    });

    const expectedRequestOptions: RequestOptions = {
      origin: '*',
      headers: {
        authorization: `Bearer `,
        'content-type': 'text/html',
      },
      method: 'GET',
      path: '/index',
      body: undefined,
    };
    expect(mockClientRequest).toBeCalledWith(expectedRequestOptions);
  });

  it('should call undici request with right JSON content type', async () => {
    mockClientRequest.mockImplementation(() => ({
      body: '{"body": "json body"}',
    }));
    await request({
      basePath: 'https://gitbar.com',
      authorization: 'token',
      method: 'GET',
      path: '/index',
      content: 'JSON',
    });

    const expectedRequestOptions: RequestOptions = {
      origin: '*',
      headers: {
        authorization: `Bearer token`,
        'content-type': 'application/json',
      },
      method: 'GET',
      path: '/index',
      body: undefined,
    };
    expect(mockClientRequest).toBeCalledWith(expectedRequestOptions);
  });

  it('should return a valid HTML string', async () => {
    const htmlMock = '<html><body>some html</body></html>';
    mockClientRequest.mockImplementation(() => ({
      body: htmlMock,
    }));
    const data = (await request({
      basePath: 'https://gitbar.com',
      authorization: '',
      method: 'GET',
      path: '/index',
      content: 'HTML',
    })) as string;

    expect(data).toBe(htmlMock);
  });
  it('should return a valid JSON response', async () => {
    const jsonMock = JSON.stringify({ body: 'content' });
    mockClientRequest.mockImplementation(() => ({
      body: jsonMock,
    }));
    const data = (await request({
      basePath: 'https://gitbar.com',
      authorization: '',
      method: 'GET',
      path: '/index',
      content: 'JSON',
    })) as string;

    expect(JSON.stringify(data)).toBe(jsonMock);
  });
});
