/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';
import { cleanObject } from '../../utils';

export const carriersOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['carriers'],
      },
    },
    options: [
      { name: 'Add Funds to Carrier', value: 'addFundsToCarrier', action: 'Add funds to carrier' },
      { name: 'Get Carrier', value: 'getCarrier', action: 'Get a carrier' },
      { name: 'List Carrier Packages', value: 'listCarrierPackages', action: 'List carrier packages' },
      { name: 'List Carrier Services', value: 'listCarrierServices', action: 'List carrier services' },
      { name: 'List Carriers', value: 'listCarriers', action: 'List carriers' },
    ],
    default: 'listCarriers',
  },
];

export const carriersFields: INodeProperties[] = [
  // Carrier Code
  {
    displayName: 'Carrier Code',
    name: 'carrierCode',
    type: 'string',
    required: true,
    default: '',
    description: 'The carrier code (e.g., stamps_com, fedex, ups)',
    displayOptions: {
      show: {
        resource: ['carriers'],
        operation: ['getCarrier', 'listCarrierServices', 'listCarrierPackages', 'addFundsToCarrier'],
      },
    },
  },
  // Amount for adding funds
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    description: 'Amount to add in dollars',
    typeOptions: {
      numberPrecision: 2,
    },
    displayOptions: {
      show: {
        resource: ['carriers'],
        operation: ['addFundsToCarrier'],
      },
    },
  },
];

export async function executeCarrierOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listCarriers': {
      responseData = await shipStationApiRequest.call(this, 'GET', '/carriers') as IDataObject[];
      break;
    }

    case 'getCarrier': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      responseData = await shipStationApiRequest.call(this, 'GET', `/carriers/getcarrier?carrierCode=${carrierCode}`) as IDataObject;
      break;
    }

    case 'listCarrierServices': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      responseData = await shipStationApiRequest.call(this, 'GET', `/carriers/listservices?carrierCode=${carrierCode}`) as IDataObject[];
      break;
    }

    case 'listCarrierPackages': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      responseData = await shipStationApiRequest.call(this, 'GET', `/carriers/listpackages?carrierCode=${carrierCode}`) as IDataObject[];
      break;
    }

    case 'addFundsToCarrier': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const amount = this.getNodeParameter('amount', i) as number;
      
      const body: IDataObject = {
        carrierCode,
        amount,
      };

      responseData = await shipStationApiRequest.call(this, 'POST', '/carriers/addfunds', cleanObject(body)) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
