/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  NodeOperationError,
} from 'n8n-workflow';

import { logLicensingNotice } from './utils';

// Import operations and fields from action modules
import { ordersOperations, ordersFields, executeOrderOperations } from './actions/orders';
import { shipmentsOperations, shipmentsFields, executeShipmentOperations } from './actions/shipments';
import { carriersOperations, carriersFields, executeCarrierOperations } from './actions/carriers';
import { ratesOperations, ratesFields, executeRateOperations } from './actions/rates';
import { customersOperations, customersFields, executeCustomerOperations } from './actions/customers';
import { storesOperations, storesFields, executeStoreOperations } from './actions/stores';
import { warehousesOperations, warehousesFields, executeWarehouseOperations } from './actions/warehouses';
import { productsOperations, productsFields, executeProductOperations } from './actions/products';
import { fulfillmentsOperations, fulfillmentsFields, executeFulfillmentOperations } from './actions/fulfillments';
import { inventoryOperations, inventoryFields, executeInventoryOperations } from './actions/inventory';
import { addressesOperations, addressesFields, executeAddressOperations } from './actions/addresses';
import { tagsOperations, tagsFields, executeTagOperations } from './actions/tags';
import { usersOperations, usersFields, executeUserOperations } from './actions/users';
import { webhooksOperations, webhooksFields, executeWebhookOperations } from './actions/webhooks';
import { manifestsOperations, manifestsFields, executeManifestOperations } from './actions/manifests';
import { pickupsOperations, pickupsFields, executePickupOperations } from './actions/pickups';
import { batchesOperations, batchesFields, executeBatchOperations } from './actions/batches';

export class ShipStation implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ShipStation',
    name: 'shipStation',
    icon: 'file:shipstation.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Consume the ShipStation API for shipping automation',
    defaults: {
      name: 'ShipStation',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'shipStationApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Address', value: 'addresses' },
          { name: 'Batch', value: 'batches' },
          { name: 'Carrier', value: 'carriers' },
          { name: 'Customer', value: 'customers' },
          { name: 'Fulfillment', value: 'fulfillments' },
          { name: 'Inventory', value: 'inventory' },
          { name: 'Manifest', value: 'manifests' },
          { name: 'Order', value: 'orders' },
          { name: 'Pickup', value: 'pickups' },
          { name: 'Product', value: 'products' },
          { name: 'Rate', value: 'rates' },
          { name: 'Shipment', value: 'shipments' },
          { name: 'Store', value: 'stores' },
          { name: 'Tag', value: 'tags' },
          { name: 'User', value: 'users' },
          { name: 'Warehouse', value: 'warehouses' },
          { name: 'Webhook', value: 'webhooks' },
        ],
        default: 'orders',
      },
      // Operations
      ...ordersOperations,
      ...shipmentsOperations,
      ...carriersOperations,
      ...ratesOperations,
      ...customersOperations,
      ...storesOperations,
      ...warehousesOperations,
      ...productsOperations,
      ...fulfillmentsOperations,
      ...inventoryOperations,
      ...addressesOperations,
      ...tagsOperations,
      ...usersOperations,
      ...webhooksOperations,
      ...manifestsOperations,
      ...pickupsOperations,
      ...batchesOperations,
      // Fields
      ...ordersFields,
      ...shipmentsFields,
      ...carriersFields,
      ...ratesFields,
      ...customersFields,
      ...storesFields,
      ...warehousesFields,
      ...productsFields,
      ...fulfillmentsFields,
      ...inventoryFields,
      ...addressesFields,
      ...tagsFields,
      ...usersFields,
      ...webhooksFields,
      ...manifestsFields,
      ...pickupsFields,
      ...batchesFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once per load
    logLicensingNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData: IDataObject | IDataObject[];

        switch (resource) {
          case 'orders':
            responseData = await executeOrderOperations.call(this, operation, i);
            break;
          case 'shipments':
            responseData = await executeShipmentOperations.call(this, operation, i);
            break;
          case 'carriers':
            responseData = await executeCarrierOperations.call(this, operation, i);
            break;
          case 'rates':
            responseData = await executeRateOperations.call(this, operation, i);
            break;
          case 'customers':
            responseData = await executeCustomerOperations.call(this, operation, i);
            break;
          case 'stores':
            responseData = await executeStoreOperations.call(this, operation, i);
            break;
          case 'warehouses':
            responseData = await executeWarehouseOperations.call(this, operation, i);
            break;
          case 'products':
            responseData = await executeProductOperations.call(this, operation, i);
            break;
          case 'fulfillments':
            responseData = await executeFulfillmentOperations.call(this, operation, i);
            break;
          case 'inventory':
            responseData = await executeInventoryOperations.call(this, operation, i);
            break;
          case 'addresses':
            responseData = await executeAddressOperations.call(this, operation, i);
            break;
          case 'tags':
            responseData = await executeTagOperations.call(this, operation, i);
            break;
          case 'users':
            responseData = await executeUserOperations.call(this, operation, i);
            break;
          case 'webhooks':
            responseData = await executeWebhookOperations.call(this, operation, i);
            break;
          case 'manifests':
            responseData = await executeManifestOperations.call(this, operation, i);
            break;
          case 'pickups':
            responseData = await executePickupOperations.call(this, operation, i);
            break;
          case 'batches':
            responseData = await executeBatchOperations.call(this, operation, i);
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Resource "${resource}" is not supported`);
        }

        // Handle array or single object response
        if (Array.isArray(responseData)) {
          returnData.push(...responseData.map((data) => ({ json: data })));
        } else {
          returnData.push({ json: responseData });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
