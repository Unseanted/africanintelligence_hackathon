import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export const useApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const getAuthToken = async () => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      return user.token;
    }
    return null;
  };

  const request = useCallback(async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    options: ApiOptions = {}
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (options.requiresAuth) {
        const token = await getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const get = useCallback((url: string, options?: ApiOptions) => {
    return request(url, 'GET', undefined, options);
  }, [request]);

  const post = useCallback((url: string, body: any, options?: ApiOptions) => {
    return request(url, 'POST', body, options);
  }, [request]);

  const put = useCallback((url: string, body: any, options?: ApiOptions) => {
    return request(url, 'PUT', body, options);
  }, [request]);

  const del = useCallback((url: string, options?: ApiOptions) => {
    return request(url, 'DELETE', undefined, options);
  }, [request]);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi; 