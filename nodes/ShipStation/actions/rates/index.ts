/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';
import { cleanObject, buildWeightObject, buildDimensionsObject } from '../../utils';
import { COUNTRIES, WEIGHT_UNITS, DIMENSION_UNITS, CONFIRMATION_TYPES } from '../../constants';

export const ratesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['rates'],
      },
    },
    options: [
      { name: 'Estimate Rates', value: 'estimateRates', action: 'Estimate rates' },
      { name: 'Get Bulk Rates', value: 'getBulkRates', action: 'Get bulk rates' },
      { name: 'Get Rates', value: 'getRates', action: 'Get rates' },
    ],
    default: 'getRates',
  },
];

export const ratesFields: INodeProperties[] = [
  // Carrier Code
  {
    displayName: 'Carrier Code',
    name: 'carrierCode',
    type: 'string',
    required: true,
    default: '',
    description: 'The carrier code (e.g., stamps_com, fedex, ups). Leave empty to get rates from all carriers.',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
  },
  // From Postal Code
  {
    displayName: 'From Postal Code',
    name: 'fromPostalCode',
    type: 'string',
    required: true,
    default: '',
    description: 'Origin postal/zip code',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
  },
  // To State
  {
    displayName: 'To State',
    name: 'toState',
    type: 'string',
    default: '',
    description: 'Destination state/province code',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
  },
  // To Country
  {
    displayName: 'To Country',
    name: 'toCountry',
    type: 'options',
    options: COUNTRIES,
    default: 'US',
    description: 'Destination country code',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
  },
  // To Postal Code
  {
    displayName: 'To Postal Code',
    name: 'toPostalCode',
    type: 'string',
    required: true,
    default: '',
    description: 'Destination postal/zip code',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
  },
  // To City
  {
    displayName: 'To City',
    name: 'toCity',
    type: 'string',
    default: '',
    description: 'Destination city',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
  },
  // Weight
  {
    displayName: 'Weight',
    name: 'weight',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    required: true,
    description: 'Package weight',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
    options: [
      { displayName: 'Value', name: 'value', type: 'number', default: 0 },
      { displayName: 'Units', name: 'units', type: 'options', options: WEIGHT_UNITS, default: 'ounces' },
    ],
  },
  // Dimensions
  {
    displayName: 'Dimensions',
    name: 'dimensions',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    description: 'Package dimensions (optional)',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
    options: [
      { displayName: 'Length', name: 'length', type: 'number', default: 0 },
      { displayName: 'Width', name: 'width', type: 'number', default: 0 },
      { displayName: 'Height', name: 'height', type: 'number', default: 0 },
      { displayName: 'Units', name: 'units', type: 'options', options: DIMENSION_UNITS, default: 'inches' },
    ],
  },
  // Additional Rate Options
  {
    displayName: 'Options',
    name: 'rateOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getRates', 'estimateRates'],
      },
    },
    options: [
      { displayName: 'Confirmation', name: 'confirmation', type: 'options', options: CONFIRMATION_TYPES, default: 'none' },
      { displayName: 'Residential', name: 'residential', type: 'boolean', default: false },
      { displayName: 'Service Code', name: 'serviceCode', type: 'string', default: '' },
      { displayName: 'Package Code', name: 'packageCode', type: 'string', default: 'package' },
    ],
  },
  // Bulk Rates JSON
  {
    displayName: 'Shipments (JSON)',
    name: 'shipments',
    type: 'json',
    required: true,
    default: '[]',
    description: 'Array of shipment objects for bulk rate calculation',
    displayOptions: {
      show: {
        resource: ['rates'],
        operation: ['getBulkRates'],
      },
    },
  },
];

export async function executeRateOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getRates': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const fromPostalCode = this.getNodeParameter('fromPostalCode', i) as string;
      const toState = this.getNodeParameter('toState', i) as string;
      const toCountry = this.getNodeParameter('toCountry', i) as string;
      const toPostalCode = this.getNodeParameter('toPostalCode', i) as string;
      const toCity = this.getNodeParameter('toCity', i) as string;
      const weight = this.getNodeParameter('weight', i) as IDataObject;
      const dimensions = this.getNodeParameter('dimensions', i) as IDataObject;
      const rateOptions = this.getNodeParameter('rateOptions', i) as IDataObject;

      const body: IDataObject = {
        carrierCode,
        fromPostalCode,
        toState,
        toCountry,
        toPostalCode,
        toCity,
        weight: buildWeightObject(weight),
        ...rateOptions,
      };

      if (dimensions && Object.keys(dimensions).length > 0) {
        body.dimensions = buildDimensionsObject(dimensions);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/getrates', cleanObject(body)) as IDataObject[];
      break;
    }

    case 'estimateRates': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const fromPostalCode = this.getNodeParameter('fromPostalCode', i) as string;
      const toState = this.getNodeParameter('toState', i) as string;
      const toCountry = this.getNodeParameter('toCountry', i) as string;
      const toPostalCode = this.getNodeParameter('toPostalCode', i) as string;
      const toCity = this.getNodeParameter('toCity', i) as string;
      const weight = this.getNodeParameter('weight', i) as IDataObject;
      const dimensions = this.getNodeParameter('dimensions', i) as IDataObject;
      const rateOptions = this.getNodeParameter('rateOptions', i) as IDataObject;

      const body: IDataObject = {
        carrierCode,
        fromPostalCode,
        toState,
        toCountry,
        toPostalCode,
        toCity,
        weight: buildWeightObject(weight),
        ...rateOptions,
      };

      if (dimensions && Object.keys(dimensions).length > 0) {
        body.dimensions = buildDimensionsObject(dimensions);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/getrates', cleanObject(body)) as IDataObject[];
      break;
    }

    case 'getBulkRates': {
      const shipmentsJson = this.getNodeParameter('shipments', i) as string;
      let shipments: IDataObject[];
      
      try {
        shipments = JSON.parse(shipmentsJson);
      } catch {
        throw new Error('Invalid JSON format for shipments');
      }

      const results: IDataObject[] = [];
      for (const shipment of shipments) {
        try {
          const rates = await shipStationApiRequest.call(this, 'POST', '/shipments/getrates', shipment) as IDataObject[];
          results.push({ shipment, rates });
        } catch (error) {
          results.push({ shipment, error: (error as Error).message });
        }
      }
      responseData = results;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
