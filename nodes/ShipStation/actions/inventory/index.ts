/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, buildQueryString } from '../../transport';
import { cleanObject } from '../../utils';

export const inventoryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['inventory'],
      },
    },
    options: [
      { name: 'Adjust Quantity', value: 'adjustQuantity', action: 'Adjust inventory quantity' },
      { name: 'Get Inventory', value: 'getInventory', action: 'Get inventory item' },
      { name: 'List Inventory', value: 'listInventory', action: 'List inventory' },
      { name: 'List by Warehouse', value: 'listByWarehouse', action: 'List inventory by warehouse' },
      { name: 'Set Quantity', value: 'setQuantity', action: 'Set inventory quantity' },
      { name: 'Update Inventory', value: 'updateInventory', action: 'Update inventory' },
    ],
    default: 'listInventory',
  },
];

export const inventoryFields: INodeProperties[] = [
  // V2 Notice
  {
    displayName: 'Inventory operations require API V2. Ensure your credentials are configured for V2.',
    name: 'inventoryNotice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['inventory'],
      },
    },
  },
  // Return All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['listInventory', 'listByWarehouse'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: { minValue: 1, maxValue: 500 },
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['listInventory', 'listByWarehouse'],
        returnAll: [false],
      },
    },
  },
  // Warehouse ID for listByWarehouse
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the warehouse',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['listByWarehouse'],
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
        resource: ['inventory'],
        operation: ['listInventory'],
      },
    },
    options: [
      { displayName: 'SKU', name: 'sku', type: 'string', default: '' },
      { displayName: 'Warehouse ID', name: 'warehouse_id', type: 'string', default: '' },
      { displayName: 'Product ID', name: 'product_id', type: 'string', default: '' },
      { displayName: 'Updated After', name: 'updated_at_start', type: 'dateTime', default: '' },
      { displayName: 'Updated Before', name: 'updated_at_end', type: 'dateTime', default: '' },
    ],
  },
  // Inventory ID for get/update
  {
    displayName: 'Inventory ID',
    name: 'inventoryId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the inventory item',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['getInventory', 'updateInventory'],
      },
    },
  },
  // SKU for quantity operations
  {
    displayName: 'SKU',
    name: 'sku',
    type: 'string',
    required: true,
    default: '',
    description: 'The SKU of the product',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjustQuantity', 'setQuantity'],
      },
    },
  },
  // Warehouse ID for quantity operations
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the warehouse',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjustQuantity', 'setQuantity'],
      },
    },
  },
  // Quantity
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'number',
    required: true,
    default: 0,
    description: 'The quantity to set or adjust by',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjustQuantity', 'setQuantity'],
      },
    },
  },
  // Reason for adjustment
  {
    displayName: 'Reason',
    name: 'reason',
    type: 'string',
    default: '',
    description: 'Reason for the inventory adjustment',
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['adjustQuantity'],
      },
    },
  },
  // Update Fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['inventory'],
        operation: ['updateInventory'],
      },
    },
    options: [
      { displayName: 'Quantity On Hand', name: 'quantity_on_hand', type: 'number', default: 0 },
      { displayName: 'Quantity Reserved', name: 'quantity_reserved', type: 'number', default: 0 },
      { displayName: 'Reorder Point', name: 'reorder_point', type: 'number', default: 0 },
      { displayName: 'Reorder Quantity', name: 'reorder_quantity', type: 'number', default: 0 },
      { displayName: 'Bin Location', name: 'bin_location', type: 'string', default: '' },
    ],
  },
];

export async function executeInventoryOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listInventory': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        // V2 uses cursor-based pagination
        const allItems: IDataObject[] = [];
        let cursor: string | undefined;
        
        do {
          if (cursor) {
            qs.cursor = cursor;
          }
          qs.page_size = 500;
          
          const response = await shipStationApiRequest.call(
            this, 'GET', '/inventory', {}, qs, 'V2',
          ) as IDataObject;
          
          const items = (response.inventory as IDataObject[]) || [];
          allItems.push(...items);
          cursor = response.cursor as string | undefined;
        } while (cursor);
        
        responseData = allItems;
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.page_size = limit;
        const response = await shipStationApiRequest.call(
          this, 'GET', '/inventory', {}, qs, 'V2',
        ) as IDataObject;
        responseData = (response.inventory as IDataObject[]) || [];
      }
      break;
    }

    case 'getInventory': {
      const inventoryId = this.getNodeParameter('inventoryId', i) as string;
      responseData = await shipStationApiRequest.call(
        this, 'GET', `/inventory/${inventoryId}`, {}, {}, 'V2',
      ) as IDataObject;
      break;
    }

    case 'updateInventory': {
      const inventoryId = this.getNodeParameter('inventoryId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
      
      responseData = await shipStationApiRequest.call(
        this, 'PUT', `/inventory/${inventoryId}`, cleanObject(updateFields), {}, 'V2',
      ) as IDataObject;
      break;
    }

    case 'listByWarehouse': {
      const warehouseId = this.getNodeParameter('warehouseId', i) as string;
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      
      const qs: IDataObject = { warehouse_id: warehouseId };

      if (returnAll) {
        const allItems: IDataObject[] = [];
        let cursor: string | undefined;
        
        do {
          if (cursor) {
            qs.cursor = cursor;
          }
          qs.page_size = 500;
          
          const response = await shipStationApiRequest.call(
            this, 'GET', '/inventory', {}, qs, 'V2',
          ) as IDataObject;
          
          const items = (response.inventory as IDataObject[]) || [];
          allItems.push(...items);
          cursor = response.cursor as string | undefined;
        } while (cursor);
        
        responseData = allItems;
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.page_size = limit;
        const response = await shipStationApiRequest.call(
          this, 'GET', '/inventory', {}, qs, 'V2',
        ) as IDataObject;
        responseData = (response.inventory as IDataObject[]) || [];
      }
      break;
    }

    case 'adjustQuantity': {
      const sku = this.getNodeParameter('sku', i) as string;
      const warehouseId = this.getNodeParameter('warehouseId', i) as string;
      const quantity = this.getNodeParameter('quantity', i) as number;
      const reason = this.getNodeParameter('reason', i, '') as string;

      const body: IDataObject = {
        sku,
        warehouse_id: warehouseId,
        quantity_adjustment: quantity,
      };

      if (reason) {
        body.reason = reason;
      }

      responseData = await shipStationApiRequest.call(
        this, 'POST', '/inventory/adjust', body, {}, 'V2',
      ) as IDataObject;
      break;
    }

    case 'setQuantity': {
      const sku = this.getNodeParameter('sku', i) as string;
      const warehouseId = this.getNodeParameter('warehouseId', i) as string;
      const quantity = this.getNodeParameter('quantity', i) as number;

      const body: IDataObject = {
        sku,
        warehouse_id: warehouseId,
        quantity_on_hand: quantity,
      };

      responseData = await shipStationApiRequest.call(
        this, 'PUT', '/inventory/quantity', body, {}, 'V2',
      ) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
