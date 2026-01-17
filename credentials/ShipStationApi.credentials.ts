/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  IHttpRequestHelper,
  INodeProperties,
} from 'n8n-workflow';

export class ShipStationApi implements ICredentialType {
  name = 'shipStationApi';
  displayName = 'ShipStation API';
  documentationUrl = 'https://www.shipstation.com/docs/api/';
  properties: INodeProperties[] = [
    {
      displayName: 'API Version',
      name: 'apiVersion',
      type: 'options',
      options: [
        {
          name: 'V1 (Classic)',
          value: 'v1',
        },
        {
          name: 'V2 (New)',
          value: 'v2',
        },
      ],
      default: 'v1',
      description: 'The ShipStation API version to use. V1 uses Basic Auth, V2 uses API Key header.',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your ShipStation API Key',
    },
    {
      displayName: 'API Secret',
      name: 'apiSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      displayOptions: {
        show: {
          apiVersion: ['v1'],
        },
      },
      description: 'Your ShipStation API Secret (V1 only)',
    },
    {
      displayName: 'Base URL (V1)',
      name: 'baseUrlV1',
      type: 'string',
      default: 'https://ssapi.shipstation.com',
      displayOptions: {
        show: {
          apiVersion: ['v1'],
        },
      },
      description: 'The base URL for the ShipStation V1 API',
    },
    {
      displayName: 'Base URL (V2)',
      name: 'baseUrlV2',
      type: 'string',
      default: 'https://api.shipstation.com/v2',
      displayOptions: {
        show: {
          apiVersion: ['v2'],
        },
      },
      description: 'The base URL for the ShipStation V2 API',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
    const apiVersion = credentials.apiVersion as string;
    
    if (apiVersion === 'v1') {
      const apiKey = credentials.apiKey as string;
      const apiSecret = credentials.apiSecret as string;
      const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
      
      return {
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
      };
    } else {
      return {
        headers: {
          'API-Key': credentials.apiKey as string,
        },
      };
    }
  }

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiVersion === "v1" ? $credentials.baseUrlV1 : $credentials.baseUrlV2}}',
      url: '={{$credentials.apiVersion === "v1" ? "/accounts/listtags" : "/labels"}}',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };
}
