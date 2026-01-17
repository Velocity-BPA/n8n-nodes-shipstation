/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems, buildQueryString } from '../../transport';

export const fulfillmentsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['fulfillments'],
      },
    },
    options: [
      { name: 'Get Fulfillment', value: 'getFulfillment', action: 'Get a fulfillment' },
      { name: 'List Fulfillments', value: 'listFulfillments', action: 'List fulfillments' },
    ],
    default: 'listFulfillments',
  },
];

export const fulfillmentsFields: INodeProperties[] = [
  // Return All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['fulfillments'],
        operation: ['listFulfillments'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: { minValue: 1 },
    displayOptions: {
      show: {
        resource: ['fulfillments'],
        operation: ['listFulfillments'],
        returnAll: [false],
      },
    },
  },
  // Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['fulfillments'],
        operation: ['listFulfillments'],
      },
    },
    options: [
      { displayName: 'Fulfillment ID', name: 'fulfillmentId', type: 'number', default: 0 },
      { displayName: 'Order ID', name: 'orderId', type: 'number', default: 0 },
      { displayName: 'Order Number', name: 'orderNumber', type: 'string', default: '' },
      { displayName: 'Tracking Number', name: 'trackingNumber', type: 'string', default: '' },
      { displayName: 'Recipient Name', name: 'recipientName', type: 'string', default: '' },
      { displayName: 'Create Date Start', name: 'createDateStart', type: 'dateTime', default: '' },
      { displayName: 'Create Date End', name: 'createDateEnd', type: 'dateTime', default: '' },
      { displayName: 'Ship Date Start', name: 'shipDateStart', type: 'dateTime', default: '' },
      { displayName: 'Ship Date End', name: 'shipDateEnd', type: 'dateTime', default: '' },
      { displayName: 'Sort By', name: 'sortBy', type: 'options', options: [
        { name: 'Ship Date', value: 'ShipDate' },
        { name: 'Create Date', value: 'CreateDate' },
      ], default: 'ShipDate' },
      { displayName: 'Sort Direction', name: 'sortDir', type: 'options', options: [
        { name: 'Ascending', value: 'ASC' },
        { name: 'Descending', value: 'DESC' },
      ], default: 'ASC' },
    ],
  },
  // Fulfillment ID
  {
    displayName: 'Fulfillment ID',
    name: 'fulfillmentId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the fulfillment',
    displayOptions: {
      show: {
        resource: ['fulfillments'],
        operation: ['getFulfillment'],
      },
    },
  },
];

export async function executeFulfillmentOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listFulfillments': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/fulfillments', 'fulfillments', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/fulfillments', {}, qs) as IDataObject;
        responseData = (response.fulfillments as IDataObject[]) || [];
      }
      break;
    }

    case 'getFulfillment': {
      const fulfillmentId = this.getNodeParameter('fulfillmentId', i) as number;
      // List with filter since there's no direct get endpoint
      const response = await shipStationApiRequest.call(
        this, 'GET', '/fulfillments', {}, { fulfillmentId },
      ) as IDataObject;
      const fulfillments = (response.fulfillments as IDataObject[]) || [];
      responseData = fulfillments.length > 0 ? fulfillments[0] : {};
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
