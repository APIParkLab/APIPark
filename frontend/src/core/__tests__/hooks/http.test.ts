
import { useFetch } from '../../src/hooks/http';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('useFetch', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('fetchData should return data correctly', async () => {
        const { fetchData } = useFetch();
        const mockData = { key: 'value' };
        fetchMock.mockResponseOnce(JSON.stringify(mockData));

        const data = await fetchData('test.com', { method: 'GET' });

        expect(data).toEqual(mockData);
        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/test.com');
    });

    it('fetchData should handle server error', async () => {
        const { fetchData } = useFetch();
        fetchMock.mockReject(() => Promise.reject('API is down'));

        await expect(fetchData('test.com', { method: 'GET' })).rejects.toMatch('API is down');
        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/test.com');
    });

    it('fetchData should handle 401 error', async () => {
        const { fetchData } = useFetch();
        fetchMock.mockResponseOnce(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        // Mocking a function to simulate redirect to login page
        const mockRedirectToLogin = jest.fn();
        global.window.location.assign = mockRedirectToLogin;
 
        await expect(fetchData('test.com', { method: 'GET' })).rejects.toThrow('Unauthorized');
        
        expect(mockRedirectToLogin).toHaveBeenCalledWith('/login');
        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/test.com');
      });
    
      it('fetchData should handle 403 error', async () => {
        const { fetchData } = useFetch();
        fetchMock.mockResponseOnce(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    
        await expect(fetchData('test.com', { method: 'GET' })).rejects.toThrow('Forbidden');
        expect(fetchMock.mock.calls.length).toEqual(1);
        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/test.com');
      });
      
    it('should handle camel case to snake case conversion in URL', async () => {
        const { fetchData } = useFetch();
        fetchMock.mockResponseOnce(JSON.stringify({}));

        await fetchData('testUrl', { method: 'GET' });

        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/test_url');
    });

    it('should handle snake case to camel case conversion in response', async () => {
        const { fetchData } = useFetch();
        const mockData = { test_key: 'value' };
        fetchMock.mockResponseOnce(JSON.stringify(mockData));

        const data = await fetchData('testUrl', { method: 'GET' });

        expect(data).toEqual({ testKey: 'value' });
    });

    it('should not transform URL if it is in the whitelist', async () => {
        const { fetchData } = useFetch();
        fetchMock.mockResponseOnce(JSON.stringify({}));

        await fetchData('api.example.com/users', { method: 'GET' });

        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/api.example.com/users');
    });

    it('should remove extra white spaces in URL', async () => {
        const { fetchData } = useFetch();
        fetchMock.mockResponseOnce(JSON.stringify({}));

        await fetchData(' test Url ', { method: 'GET' });

        expect(fetchMock.mock.calls[0][0]).toEqual('/api/v1/test_url');
    });
});