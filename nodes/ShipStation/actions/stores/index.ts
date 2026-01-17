/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';
import { cleanObject } from '../../utils';

export const storesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['stores'],
      },
    },
    options: [
      { name: 'Deactivate Store', value: 'deactivateStore', action: 'Deactivate a store' },
      { name: 'Get Store', value: 'getStore', action: 'Get a store' },
      { name: 'Get Store Refresh Status', value: 'getStoreRefreshStatus', action: 'Get store refresh status' },
      { name: 'List Stores', value: 'listStores', action: 'List stores' },
      { name: 'Refresh Store', value: 'refreshStore', action: 'Refresh store data' },
      { name: 'Update Store', value: 'updateStore', action: 'Update a store' },
    ],
    default: 'listStores',
  },
];

export const storesFields: INodeProperties[] = [
  // Store ID
  {
    displayName: 'Store ID',
    name: 'storeId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the store',
    displayOptions: {
      show: {
        resource: ['stores'],
        operation: ['getStore', 'updateStore', 'getStoreRefreshStatus', 'refreshStore', 'deactivateStore'],
      },
    },
  },
  // Filters for listStores
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['stores'],
        operation: ['listStores'],
      },
    },
    options: [
      { displayName: 'Show Inactive', name: 'showInactive', type: 'boolean', default: false },
      { displayName: 'Marketplace ID', name: 'marketplaceId', type: 'number', default: 0 },
    ],
  },
  // Update Store Fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['stores'],
        operation: ['updateStore'],
      },
    },
    options: [
      { displayName: 'Store Name', name: 'storeName', type: 'string', default: '' },
      { displayName: 'Marketplace ID', name: 'marketplaceId', type: 'number', default: 0 },
      { displayName: 'Auto Refresh', name: 'autoRefresh', type: 'boolean', default: true },
      { displayName: 'Status Mappings (JSON)', name: 'statusMappings', type: 'json', default: '[]' },
    ],
  },
  // Refresh Date Range
  {
    displayName: 'Refresh Options',
    name: 'refreshOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['stores'],
        operation: ['refreshStore'],
      },
    },
    options: [
      { displayName: 'Refresh Date', name: 'refreshDate', type: 'dateTime', default: '' },
    ],
  },
];

export async function executeStoreOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listStores': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      let endpoint = '/stores';
      const qs: IDataObject = {};
      
      if (filters.showInactive) {
        qs.showInactive = filters.showInactive;
      }
      if (filters.marketplaceId) {
        qs.marketplaceId = filters.marketplaceId;
      }

      responseData = await shipStationApiRequest.call(this, 'GET', endpoint, {}, qs) as IDataObject[];
      break;
    }

    case 'getStore': {
      const storeId = this.getNodeParameter('storeId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'GET', `/stores/${storeId}`) as IDataObject;
      break;
    }

    case 'updateStore': {
      const storeId = this.getNodeParameter('storeId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      
      const body: IDataObject = {
        storeId,
        ...updateFields,
      };

      if (updateFields.statusMappings) {
        body.statusMappings = JSON.parse(updateFields.statusMappings as string);
      }

      responseData = await shipStationApiRequest.call(this, 'PUT', `/stores/${storeId}`, cleanObject(body)) as IDataObject;
      break;
    }

    case 'getStoreRefreshStatus': {
      const storeId = this.getNodeParameter('storeId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'GET', `/stores/getrefreshstatus?storeId=${storeId}`) as IDataObject;
      break;
    }

    case 'refreshStore': {
      const storeId = this.getNodeParameter('storeId', i) as number;
      const refreshOptions = this.getNodeParameter('refreshOptions', i) as IDataObject;
      
      const body: IDataObject = {
        storeId,
        ...refreshOptions,
      };

      responseData = await shipStationApiRequest.call(this, 'POST', '/stores/refreshstore', cleanObject(body)) as IDataObject;
      break;
    }

    case 'deactivateStore': {
      const storeId = this.getNodeParameter('storeId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'DELETE', `/stores/deactivate?storeId=${storeId}`) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
