/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems, buildQueryString } from '../../transport';
import { cleanObject, formatDate, parseItemsJson, buildAddressObject } from '../../utils';
import { ORDER_STATUSES, COUNTRIES } from '../../constants';

export const ordersOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['orders'],
      },
    },
    options: [
      { name: 'Add Tag to Order', value: 'addTagToOrder', action: 'Add tag to order' },
      { name: 'Assign User', value: 'assignUser', action: 'Assign user to order' },
      { name: 'Create Order', value: 'createOrder', action: 'Create an order' },
      { name: 'Create or Update Order', value: 'createOrUpdateOrder', action: 'Create or update an order' },
      { name: 'Delete Order', value: 'deleteOrder', action: 'Delete an order' },
      { name: 'Get Order', value: 'getOrder', action: 'Get an order' },
      { name: 'Hold Order', value: 'holdOrder', action: 'Hold an order' },
      { name: 'List Orders', value: 'listOrders', action: 'List orders' },
      { name: 'List Orders by Tag', value: 'listOrdersByTag', action: 'List orders by tag' },
      { name: 'Mark as Shipped', value: 'markAsShipped', action: 'Mark order as shipped' },
      { name: 'Release Hold', value: 'releaseHold', action: 'Release order hold' },
      { name: 'Remove Tag from Order', value: 'removeTagFromOrder', action: 'Remove tag from order' },
      { name: 'Restore from Hold', value: 'restoreFromHold', action: 'Restore order from hold' },
      { name: 'Unassign User', value: 'unassignUser', action: 'Unassign user from order' },
      { name: 'Update Order', value: 'updateOrder', action: 'Update an order' },
    ],
    default: 'listOrders',
  },
];

export const ordersFields: INodeProperties[] = [
  // List Orders fields
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['listOrders', 'listOrdersByTag'],
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
        resource: ['orders'],
        operation: ['listOrders', 'listOrdersByTag'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['listOrders'],
      },
    },
    options: [
      {
        displayName: 'Customer Name',
        name: 'customerName',
        type: 'string',
        default: '',
        description: 'Filter by customer name',
      },
      {
        displayName: 'Item Keyword',
        name: 'itemKeyword',
        type: 'string',
        default: '',
        description: 'Filter by item keyword',
      },
      {
        displayName: 'Create Date Start',
        name: 'createDateStart',
        type: 'dateTime',
        default: '',
        description: 'Filter orders created on or after this date',
      },
      {
        displayName: 'Create Date End',
        name: 'createDateEnd',
        type: 'dateTime',
        default: '',
        description: 'Filter orders created on or before this date',
      },
      {
        displayName: 'Modify Date Start',
        name: 'modifyDateStart',
        type: 'dateTime',
        default: '',
        description: 'Filter orders modified on or after this date',
      },
      {
        displayName: 'Modify Date End',
        name: 'modifyDateEnd',
        type: 'dateTime',
        default: '',
        description: 'Filter orders modified on or before this date',
      },
      {
        displayName: 'Order Date Start',
        name: 'orderDateStart',
        type: 'dateTime',
        default: '',
        description: 'Filter orders placed on or after this date',
      },
      {
        displayName: 'Order Date End',
        name: 'orderDateEnd',
        type: 'dateTime',
        default: '',
        description: 'Filter orders placed on or before this date',
      },
      {
        displayName: 'Order Number',
        name: 'orderNumber',
        type: 'string',
        default: '',
        description: 'Filter by order number',
      },
      {
        displayName: 'Order Status',
        name: 'orderStatus',
        type: 'options',
        options: ORDER_STATUSES,
        default: '',
        description: 'Filter by order status',
      },
      {
        displayName: 'Payment Date Start',
        name: 'paymentDateStart',
        type: 'dateTime',
        default: '',
        description: 'Filter orders paid on or after this date',
      },
      {
        displayName: 'Payment Date End',
        name: 'paymentDateEnd',
        type: 'dateTime',
        default: '',
        description: 'Filter orders paid on or before this date',
      },
      {
        displayName: 'Store ID',
        name: 'storeId',
        type: 'number',
        default: 0,
        description: 'Filter by store ID',
      },
      {
        displayName: 'Sort By',
        name: 'sortBy',
        type: 'options',
        options: [
          { name: 'Order Date', value: 'OrderDate' },
          { name: 'Modify Date', value: 'ModifyDate' },
          { name: 'Create Date', value: 'CreateDate' },
        ],
        default: 'OrderDate',
        description: 'Sort results by this field',
      },
      {
        displayName: 'Sort Direction',
        name: 'sortDir',
        type: 'options',
        options: [
          { name: 'Ascending', value: 'ASC' },
          { name: 'Descending', value: 'DESC' },
        ],
        default: 'DESC',
        description: 'Sort direction',
      },
    ],
  },
  // Get Order
  {
    displayName: 'Order ID',
    name: 'orderId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the order',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['getOrder', 'deleteOrder', 'addTagToOrder', 'removeTagFromOrder', 'assignUser', 'unassignUser', 'holdOrder', 'releaseHold', 'restoreFromHold'],
      },
    },
  },
  // Tag ID for tag operations
  {
    displayName: 'Tag ID',
    name: 'tagId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the tag',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['addTagToOrder', 'removeTagFromOrder', 'listOrdersByTag'],
      },
    },
  },
  // User ID for assign operations
  {
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the user to assign',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['assignUser'],
      },
    },
  },
  // Hold Until Date
  {
    displayName: 'Hold Until',
    name: 'holdUntilDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'Date to hold the order until',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['holdOrder'],
      },
    },
  },
  // Create/Update Order fields
  {
    displayName: 'Order Number',
    name: 'orderNumber',
    type: 'string',
    required: true,
    default: '',
    description: 'A unique order number',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder', 'updateOrder'],
      },
    },
  },
  {
    displayName: 'Order Date',
    name: 'orderDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'The date of the order',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder'],
      },
    },
  },
  {
    displayName: 'Order Status',
    name: 'orderStatus',
    type: 'options',
    options: ORDER_STATUSES,
    required: true,
    default: 'awaiting_shipment',
    description: 'The status of the order',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder'],
      },
    },
  },
  // Bill To Address
  {
    displayName: 'Bill To',
    name: 'billTo',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    description: 'Billing address',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder', 'updateOrder'],
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
  // Ship To Address
  {
    displayName: 'Ship To',
    name: 'shipTo',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    description: 'Shipping address',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder', 'updateOrder'],
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
      { displayName: 'Residential', name: 'residential', type: 'boolean', default: false },
    ],
  },
  // Order Items
  {
    displayName: 'Items (JSON)',
    name: 'items',
    type: 'json',
    default: '[]',
    description: 'Order items as JSON array. Each item should have: sku, name, quantity, unitPrice',
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder', 'updateOrder'],
      },
    },
  },
  // Additional Order Options
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['createOrder', 'createOrUpdateOrder', 'updateOrder'],
      },
    },
    options: [
      { displayName: 'Customer Email', name: 'customerEmail', type: 'string', default: '' },
      { displayName: 'Customer Username', name: 'customerUsername', type: 'string', default: '' },
      { displayName: 'Amount Paid', name: 'amountPaid', type: 'number', default: 0 },
      { displayName: 'Tax Amount', name: 'taxAmount', type: 'number', default: 0 },
      { displayName: 'Shipping Amount', name: 'shippingAmount', type: 'number', default: 0 },
      { displayName: 'Customer Notes', name: 'customerNotes', type: 'string', default: '' },
      { displayName: 'Internal Notes', name: 'internalNotes', type: 'string', default: '' },
      { displayName: 'Gift', name: 'gift', type: 'boolean', default: false },
      { displayName: 'Gift Message', name: 'giftMessage', type: 'string', default: '' },
      { displayName: 'Requested Shipping Service', name: 'requestedShippingService', type: 'string', default: '' },
      { displayName: 'Carrier Code', name: 'carrierCode', type: 'string', default: '' },
      { displayName: 'Service Code', name: 'serviceCode', type: 'string', default: '' },
      { displayName: 'Package Code', name: 'packageCode', type: 'string', default: '' },
      { displayName: 'Confirmation', name: 'confirmation', type: 'string', default: '' },
      { displayName: 'Ship Date', name: 'shipDate', type: 'dateTime', default: '' },
    ],
  },
  // Mark as Shipped fields
  {
    displayName: 'Mark as Shipped Options',
    name: 'markAsShippedOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['orders'],
        operation: ['markAsShipped'],
      },
    },
    options: [
      { displayName: 'Order ID', name: 'orderId', type: 'number', default: 0, description: 'Order ID to mark as shipped' },
      { displayName: 'Carrier Code', name: 'carrierCode', type: 'string', default: '' },
      { displayName: 'Ship Date', name: 'shipDate', type: 'dateTime', default: '' },
      { displayName: 'Tracking Number', name: 'trackingNumber', type: 'string', default: '' },
      { displayName: 'Notify Customer', name: 'notifyCustomer', type: 'boolean', default: true },
      { displayName: 'Notify Sales Channel', name: 'notifySalesChannel', type: 'boolean', default: true },
    ],
  },
];

export async function executeOrderOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listOrders': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/orders', 'orders', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/orders', {}, qs) as IDataObject;
        responseData = (response.orders as IDataObject[]) || [];
      }
      break;
    }

    case 'getOrder': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'GET', `/orders/${orderId}`) as IDataObject;
      break;
    }

    case 'createOrder':
    case 'createOrUpdateOrder': {
      const orderNumber = this.getNodeParameter('orderNumber', i) as string;
      const orderDate = this.getNodeParameter('orderDate', i) as string;
      const orderStatus = this.getNodeParameter('orderStatus', i) as string;
      const billTo = this.getNodeParameter('billTo', i) as IDataObject;
      const shipTo = this.getNodeParameter('shipTo', i) as IDataObject;
      const itemsJson = this.getNodeParameter('items', i) as string;
      const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

      const body: IDataObject = {
        orderNumber,
        orderDate: formatDate(orderDate),
        orderStatus,
        billTo: buildAddressObject(billTo),
        shipTo: buildAddressObject(shipTo),
        items: parseItemsJson(itemsJson),
        ...additionalOptions,
      };

      const endpoint = operation === 'createOrUpdateOrder' ? '/orders/createorder' : '/orders/createorder';
      responseData = await shipStationApiRequest.call(this, 'POST', endpoint, cleanObject(body)) as IDataObject;
      break;
    }

    case 'updateOrder': {
      const orderNumber = this.getNodeParameter('orderNumber', i) as string;
      const billTo = this.getNodeParameter('billTo', i) as IDataObject;
      const shipTo = this.getNodeParameter('shipTo', i) as IDataObject;
      const itemsJson = this.getNodeParameter('items', i) as string;
      const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

      const body: IDataObject = {
        orderNumber,
        billTo: buildAddressObject(billTo),
        shipTo: buildAddressObject(shipTo),
        items: parseItemsJson(itemsJson),
        ...additionalOptions,
      };

      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/createorder', cleanObject(body)) as IDataObject;
      break;
    }

    case 'deleteOrder': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'DELETE', `/orders/${orderId}`) as IDataObject;
      break;
    }

    case 'listOrdersByTag': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const tagId = this.getNodeParameter('tagId', i) as number;
      const qs: IDataObject = { orderStatus: 'awaiting_shipment', tagId };

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/orders/listbytag', 'orders', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/orders/listbytag', {}, qs) as IDataObject;
        responseData = (response.orders as IDataObject[]) || [];
      }
      break;
    }

    case 'addTagToOrder': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      const tagId = this.getNodeParameter('tagId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/addtag', { orderId, tagId }) as IDataObject;
      break;
    }

    case 'removeTagFromOrder': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      const tagId = this.getNodeParameter('tagId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/removetag', { orderId, tagId }) as IDataObject;
      break;
    }

    case 'assignUser': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      const userId = this.getNodeParameter('userId', i) as string;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/assignuser', { orderIds: [orderId], userId }) as IDataObject;
      break;
    }

    case 'unassignUser': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/unassignuser', { orderIds: [orderId] }) as IDataObject;
      break;
    }

    case 'holdOrder': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      const holdUntilDate = this.getNodeParameter('holdUntilDate', i) as string;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/holduntil', { 
        orderId, 
        holdUntilDate: formatDate(holdUntilDate),
      }) as IDataObject;
      break;
    }

    case 'releaseHold':
    case 'restoreFromHold': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/restorefromhold', { orderId }) as IDataObject;
      break;
    }

    case 'markAsShipped': {
      const options = this.getNodeParameter('markAsShippedOptions', i) as IDataObject;
      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/markasshipped', cleanObject(options)) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
