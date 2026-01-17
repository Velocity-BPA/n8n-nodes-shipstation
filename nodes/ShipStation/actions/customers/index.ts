/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems, buildQueryString } from '../../transport';

export const customersOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['customers'],
      },
    },
    options: [
      { name: 'Get Customer', value: 'getCustomer', action: 'Get a customer' },
      { name: 'List Customers', value: 'listCustomers', action: 'List customers' },
    ],
    default: 'listCustomers',
  },
];

export const customersFields: INodeProperties[] = [
  // Return All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['customers'],
        operation: ['listCustomers'],
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
        resource: ['customers'],
        operation: ['listCustomers'],
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
        resource: ['customers'],
        operation: ['listCustomers'],
      },
    },
    options: [
      { displayName: 'State Code', name: 'stateCode', type: 'string', default: '' },
      { displayName: 'Country Code', name: 'countryCode', type: 'string', default: '' },
      { displayName: 'Marketplace ID', name: 'marketplaceId', type: 'number', default: 0 },
      { displayName: 'Tag ID', name: 'tagId', type: 'number', default: 0 },
      { displayName: 'Sort By', name: 'sortBy', type: 'options', options: [
        { name: 'Name', value: 'Name' },
        { name: 'Modify Date', value: 'ModifyDate' },
        { name: 'Create Date', value: 'CreateDate' },
      ], default: 'Name' },
      { displayName: 'Sort Direction', name: 'sortDir', type: 'options', options: [
        { name: 'Ascending', value: 'ASC' },
        { name: 'Descending', value: 'DESC' },
      ], default: 'ASC' },
    ],
  },
  // Customer ID
  {
    displayName: 'Customer ID',
    name: 'customerId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the customer',
    displayOptions: {
      show: {
        resource: ['customers'],
        operation: ['getCustomer'],
      },
    },
  },
];

export async function executeCustomerOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listCustomers': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/customers', 'customers', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/customers', {}, qs) as IDataObject;
        responseData = (response.customers as IDataObject[]) || [];
      }
      break;
    }

    case 'getCustomer': {
      const customerId = this.getNodeParameter('customerId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'GET', `/customers/${customerId}`) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
