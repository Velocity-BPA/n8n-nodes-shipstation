/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  IDataObject,
  NodeApiError,
  NodeOperationError,
  JsonObject,
} from 'n8n-workflow';

import {
  SHIPSTATION_API_V1_BASE_URL,
  SHIPSTATION_API_V2_BASE_URL,
} from '../constants';

export interface IShipStationCredentials {
  apiVersion: 'v1' | 'v2';
  apiKey: string;
  apiSecret?: string;
  baseUrlV1?: string;
  baseUrlV2?: string;
}

export async function shipStationApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  uri?: string,
  option: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  const credentials = await this.getCredentials('shipStationApi') as IShipStationCredentials;
  
  const apiVersion = credentials.apiVersion || 'v1';
  
  let baseUrl: string;
  if (apiVersion === 'v1') {
    baseUrl = credentials.baseUrlV1 || SHIPSTATION_API_V1_BASE_URL;
  } else {
    baseUrl = credentials.baseUrlV2 || SHIPSTATION_API_V2_BASE_URL;
  }

  const options: IHttpRequestOptions = {
    method,
    url: uri || `${baseUrl}${endpoint}`,
    qs,
    body,
    json: true,
    ...option,
  };

  // Set headers based on API version
  options.headers = {
    'Content-Type': 'application/json',
  };

  if (apiVersion === 'v1') {
    const apiKey = credentials.apiKey;
    const apiSecret = credentials.apiSecret || '';
    const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    options.headers.Authorization = `Basic ${basicAuth}`;
  } else {
    options.headers['API-Key'] = credentials.apiKey;
  }

  // Remove empty body for GET requests
  if (method === 'GET') {
    delete options.body;
  }

  // Remove empty query parameters
  if (Object.keys(qs).length === 0) {
    delete options.qs;
  }

  try {
    const response = await this.helpers.httpRequest(options);
    return response as IDataObject | IDataObject[];
  } catch (error: unknown) {
    if (error instanceof NodeApiError || error instanceof NodeOperationError) {
      throw error;
    }
    
    const err = error as Error & { 
      statusCode?: number; 
      response?: { body?: { Message?: string; ExceptionMessage?: string } };
      message?: string;
    };
    
    if (err.statusCode === 429) {
      throw new NodeOperationError(
        this.getNode(),
        'Rate limit exceeded. ShipStation allows 40 requests per minute.',
        { description: 'Please wait before making more requests.' },
      );
    }
    
    if (err.statusCode === 401) {
      throw new NodeOperationError(
        this.getNode(),
        'Invalid API credentials',
        { description: 'Please check your API key and secret.' },
      );
    }
    
    const errorMessage = err.response?.body?.Message || 
                         err.response?.body?.ExceptionMessage || 
                         err.message || 
                         'Unknown error occurred';
    
    throw new NodeApiError(this.getNode(), { message: errorMessage } as JsonObject, {
      message: errorMessage,
    });
  }
}

export async function shipStationApiRequestAllItems(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  propertyName: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  
  let responseData: IDataObject;
  qs.page = 1;
  qs.pageSize = 100;

  do {
    responseData = (await shipStationApiRequest.call(
      this,
      method,
      endpoint,
      body,
      qs,
    )) as IDataObject;

    const items = responseData[propertyName] as IDataObject[];
    if (items && Array.isArray(items)) {
      returnData.push(...items);
    }

    qs.page = (qs.page as number) + 1;
  } while (
    responseData.pages !== undefined &&
    (qs.page as number) <= (responseData.pages as number)
  );

  return returnData;
}

export function validateApiVersion(
  this: IExecuteFunctions | IHookFunctions,
  requiredVersion: 'V1' | 'V2',
  operation: string,
): void {
  // Note: API version is determined by credentials, not a node parameter
  // This is a validation helper that can be called to inform users
  // about version requirements when necessary
}

export function buildQueryString(params: IDataObject): IDataObject {
  const qs: IDataObject = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle nested objects for date ranges, etc.
        for (const [nestedKey, nestedValue] of Object.entries(value as IDataObject)) {
          if (nestedValue !== undefined && nestedValue !== '' && nestedValue !== null) {
            qs[`${key}${nestedKey.charAt(0).toUpperCase()}${nestedKey.slice(1)}`] = nestedValue;
          }
        }
      } else {
        qs[key] = value;
      }
    }
  }
  
  return qs;
}

export function formatDateForApi(date: string | Date): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}
