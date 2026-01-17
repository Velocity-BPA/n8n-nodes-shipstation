/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';
import { cleanObject, buildAddressObject } from '../../utils';
import { COUNTRIES } from '../../constants';

export const warehousesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['warehouses'],
      },
    },
    options: [
      { name: 'Create Warehouse', value: 'createWarehouse', action: 'Create a warehouse' },
      { name: 'Delete Warehouse', value: 'deleteWarehouse', action: 'Delete a warehouse' },
      { name: 'Get Warehouse', value: 'getWarehouse', action: 'Get a warehouse' },
      { name: 'List Inventory Warehouses (V2)', value: 'listInventoryWarehouses', action: 'List inventory warehouses' },
      { name: 'List Warehouses', value: 'listWarehouses', action: 'List warehouses' },
      { name: 'Update Warehouse', value: 'updateWarehouse', action: 'Update a warehouse' },
    ],
    default: 'listWarehouses',
  },
];

export const warehousesFields: INodeProperties[] = [
  // Warehouse ID
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the warehouse',
    displayOptions: {
      show: {
        resource: ['warehouses'],
        operation: ['getWarehouse', 'updateWarehouse', 'deleteWarehouse'],
      },
    },
  },
  // Warehouse Name
  {
    displayName: 'Warehouse Name',
    name: 'warehouseName',
    type: 'string',
    required: true,
    default: '',
    description: 'Name of the warehouse',
    displayOptions: {
      show: {
        resource: ['warehouses'],
        operation: ['createWarehouse'],
      },
    },
  },
  // Origin Address
  {
    displayName: 'Origin Address',
    name: 'originAddress',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    required: true,
    description: 'Warehouse address',
    displayOptions: {
      show: {
        resource: ['warehouses'],
        operation: ['createWarehouse', 'updateWarehouse'],
      },
    },
    options: [
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Company', name: 'company', type: 'string', default: '' },
      { displayName: 'Street 1', name: 'street1', type: 'string', default: '' },
      { displayName: 'Street 2', name: 'street2', type: 'string', default: '' },
      { displayName: 'City', name: 'city', type: 'string', default: '' },
      { displayName: 'State', name: 'state', type: 'string', default: '' },
      { displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
      { displayName: 'Country', name: 'country', type: 'options', options: COUNTRIES, default: 'US' },
      { displayName: 'Phone', name: 'phone', type: 'string', default: '' },
    ],
  },
  // Return Address
  {
    displayName: 'Return Address',
    name: 'returnAddress',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    description: 'Return address (if different from origin)',
    displayOptions: {
      show: {
        resource: ['warehouses'],
        operation: ['createWarehouse', 'updateWarehouse'],
      },
    },
    options: [
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Company', name: 'company', type: 'string', default: '' },
      { displayName: 'Street 1', name: 'street1', type: 'string', default: '' },
      { displayName: 'Street 2', name: 'street2', type: 'string', default: '' },
      { displayName: 'City', name: 'city', type: 'string', default: '' },
      { displayName: 'State', name: 'state', type: 'string', default: '' },
      { displayName: 'Postal Code', name: 'postalCode', type: 'string', default: '' },
      { displayName: 'Country', name: 'country', type: 'options', options: COUNTRIES, default: 'US' },
      { displayName: 'Phone', name: 'phone', type: 'string', default: '' },
    ],
  },
  // Additional Options
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['warehouses'],
        operation: ['createWarehouse', 'updateWarehouse'],
      },
    },
    options: [
      { displayName: 'Is Default', name: 'isDefault', type: 'boolean', default: false },
    ],
  },
];

export async function executeWarehouseOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listWarehouses': {
      responseData = await shipStationApiRequest.call(this, 'GET', '/warehouses') as IDataObject[];
      break;
    }

    case 'getWarehouse': {
      const warehouseId = this.getNodeParameter('warehouseId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'GET', `/warehouses/${warehouseId}`) as IDataObject;
      break;
    }

    case 'createWarehouse': {
      const warehouseName = this.getNodeParameter('warehouseName', i) as string;
      const originAddress = this.getNodeParameter('originAddress', i) as IDataObject;
      const returnAddress = this.getNodeParameter('returnAddress', i) as IDataObject;
      const options = this.getNodeParameter('options', i) as IDataObject;

      const body: IDataObject = {
        warehouseName,
        originAddress: buildAddressObject(originAddress),
        ...options,
      };

      if (returnAddress && Object.keys(returnAddress).length > 0) {
        body.returnAddress = buildAddressObject(returnAddress);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/warehouses/createwarehouse', cleanObject(body)) as IDataObject;
      break;
    }

    case 'updateWarehouse': {
      const warehouseId = this.getNodeParameter('warehouseId', i) as number;
      const originAddress = this.getNodeParameter('originAddress', i) as IDataObject;
      const returnAddress = this.getNodeParameter('returnAddress', i) as IDataObject;
      const options = this.getNodeParameter('options', i) as IDataObject;

      const body: IDataObject = {
        warehouseId,
        originAddress: buildAddressObject(originAddress),
        ...options,
      };

      if (returnAddress && Object.keys(returnAddress).length > 0) {
        body.returnAddress = buildAddressObject(returnAddress);
      }

      responseData = await shipStationApiRequest.call(this, 'PUT', `/warehouses/${warehouseId}`, cleanObject(body)) as IDataObject;
      break;
    }

    case 'deleteWarehouse': {
      const warehouseId = this.getNodeParameter('warehouseId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'DELETE', `/warehouses/${warehouseId}`) as IDataObject;
      break;
    }

    case 'listInventoryWarehouses': {
      // V2 API endpoint
      responseData = await shipStationApiRequest.call(this, 'GET', '/inventory/warehouses') as IDataObject[];
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
