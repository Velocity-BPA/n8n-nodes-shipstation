/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';

export const addressesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['addresses'],
      },
    },
    options: [
      { name: 'Parse Address', value: 'parseAddress', action: 'Parse an address string' },
      { name: 'Validate Address', value: 'validateAddress', action: 'Validate an address' },
    ],
    default: 'validateAddress',
  },
];

export const addressesFields: INodeProperties[] = [
  // Parse Address - raw address string
  {
    displayName: 'Address String',
    name: 'addressString',
    type: 'string',
    required: true,
    default: '',
    description: 'The raw address string to parse (e.g., "123 Main St, New York, NY 10001")',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['parseAddress'],
      },
    },
  },
  // Validate Address - structured fields
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    description: 'Name associated with the address',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Company',
    name: 'company',
    type: 'string',
    default: '',
    description: 'Company name',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Street 1',
    name: 'street1',
    type: 'string',
    required: true,
    default: '',
    description: 'Street address line 1',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Street 2',
    name: 'street2',
    type: 'string',
    default: '',
    description: 'Street address line 2',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Street 3',
    name: 'street3',
    type: 'string',
    default: '',
    description: 'Street address line 3',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'City',
    name: 'city',
    type: 'string',
    required: true,
    default: '',
    description: 'City name',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'State',
    name: 'state',
    type: 'string',
    required: true,
    default: '',
    description: 'State or province code',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Postal Code',
    name: 'postalCode',
    type: 'string',
    required: true,
    default: '',
    description: 'Postal or ZIP code',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Country Code',
    name: 'countryCode',
    type: 'string',
    default: 'US',
    description: 'Two-letter ISO country code',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Phone',
    name: 'phone',
    type: 'string',
    default: '',
    description: 'Phone number',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
  {
    displayName: 'Residential',
    name: 'residential',
    type: 'boolean',
    default: false,
    description: 'Whether the address is residential',
    displayOptions: {
      show: {
        resource: ['addresses'],
        operation: ['validateAddress'],
      },
    },
  },
];

export async function executeAddressOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'validateAddress': {
      const body: IDataObject = {
        name: this.getNodeParameter('name', i, '') as string,
        company: this.getNodeParameter('company', i, '') as string,
        street1: this.getNodeParameter('street1', i) as string,
        street2: this.getNodeParameter('street2', i, '') as string,
        street3: this.getNodeParameter('street3', i, '') as string,
        city: this.getNodeParameter('city', i) as string,
        state: this.getNodeParameter('state', i) as string,
        postalCode: this.getNodeParameter('postalCode', i) as string,
        country: this.getNodeParameter('countryCode', i, 'US') as string,
        phone: this.getNodeParameter('phone', i, '') as string,
        residential: this.getNodeParameter('residential', i, false) as boolean,
      };

      // Remove empty fields
      Object.keys(body).forEach(key => {
        if (body[key] === '' || body[key] === null || body[key] === undefined) {
          delete body[key];
        }
      });

      responseData = await shipStationApiRequest.call(
        this, 'POST', '/addresses/validate', body,
      ) as IDataObject;
      break;
    }

    case 'parseAddress': {
      const addressString = this.getNodeParameter('addressString', i) as string;
      
      // Parse the address by sending it as a single string
      // ShipStation doesn't have a dedicated parse endpoint in V1, 
      // so we send to validate and it will normalize/parse
      const body: IDataObject = {
        street1: addressString,
        city: '',
        state: '',
        postalCode: '',
        country: 'US',
      };

      try {
        responseData = await shipStationApiRequest.call(
          this, 'POST', '/addresses/validate', body,
        ) as IDataObject;
      } catch {
        // If validation fails, return the original with a parse attempt
        const parts = addressString.split(',').map(p => p.trim());
        responseData = {
          originalAddress: addressString,
          parsedStreet: parts[0] || '',
          parsedCity: parts[1] || '',
          parsedStateZip: parts[2] || '',
          parsedCountry: parts[3] || 'US',
          validated: false,
          message: 'Address could not be validated. Manual verification recommended.',
        };
      }
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
