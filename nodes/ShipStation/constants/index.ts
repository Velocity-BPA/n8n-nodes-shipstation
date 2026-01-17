/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodePropertyOptions } from 'n8n-workflow';

export const SHIPSTATION_API_V1_BASE_URL = 'https://ssapi.shipstation.com';
export const SHIPSTATION_API_V2_BASE_URL = 'https://api.shipstation.com/v2';

export const RESOURCES: INodePropertyOptions[] = [
  { name: 'Orders', value: 'orders' },
  { name: 'Shipments', value: 'shipments' },
  { name: 'Carriers', value: 'carriers' },
  { name: 'Rates', value: 'rates' },
  { name: 'Customers', value: 'customers' },
  { name: 'Stores', value: 'stores' },
  { name: 'Warehouses', value: 'warehouses' },
  { name: 'Products', value: 'products' },
  { name: 'Fulfillments', value: 'fulfillments' },
  { name: 'Inventory', value: 'inventory' },
  { name: 'Addresses', value: 'addresses' },
  { name: 'Tags', value: 'tags' },
  { name: 'Users', value: 'users' },
  { name: 'Webhooks', value: 'webhooks' },
  { name: 'Manifests', value: 'manifests' },
  { name: 'Pickups', value: 'pickups' },
  { name: 'Batches', value: 'batches' },
];

export const ORDER_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Orders', value: 'listOrders' },
  { name: 'Get Order', value: 'getOrder' },
  { name: 'Create Order', value: 'createOrder' },
  { name: 'Update Order', value: 'updateOrder' },
  { name: 'Delete Order', value: 'deleteOrder' },
  { name: 'Create or Update Order', value: 'createOrUpdateOrder' },
  { name: 'List Orders by Tag', value: 'listOrdersByTag' },
  { name: 'Add Tag to Order', value: 'addTagToOrder' },
  { name: 'Remove Tag from Order', value: 'removeTagFromOrder' },
  { name: 'Assign User', value: 'assignUser' },
  { name: 'Unassign User', value: 'unassignUser' },
  { name: 'Hold Order', value: 'holdOrder' },
  { name: 'Release Hold', value: 'releaseHold' },
  { name: 'Restore from Hold', value: 'restoreFromHold' },
  { name: 'Mark as Shipped', value: 'markAsShipped' },
];

export const SHIPMENT_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Shipments', value: 'listShipments' },
  { name: 'Get Shipment', value: 'getShipment' },
  { name: 'Create Label', value: 'createLabel' },
  { name: 'Void Label', value: 'voidLabel' },
  { name: 'Get Shipment Rates', value: 'getShipmentRates' },
  { name: 'Create Label from Shipment', value: 'createLabelFromShipment' },
  { name: 'Create Return Label', value: 'createReturnLabel' },
  { name: 'Create Label from Order', value: 'createLabelFromOrder' },
];

export const CARRIER_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Carriers', value: 'listCarriers' },
  { name: 'Get Carrier', value: 'getCarrier' },
  { name: 'List Carrier Services', value: 'listCarrierServices' },
  { name: 'List Carrier Packages', value: 'listCarrierPackages' },
  { name: 'Add Funds to Carrier', value: 'addFundsToCarrier' },
];

export const RATE_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Get Rates', value: 'getRates' },
  { name: 'Get Bulk Rates', value: 'getBulkRates' },
  { name: 'Estimate Rates', value: 'estimateRates' },
];

export const CUSTOMER_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Customers', value: 'listCustomers' },
  { name: 'Get Customer', value: 'getCustomer' },
];

export const STORE_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Stores', value: 'listStores' },
  { name: 'Get Store', value: 'getStore' },
  { name: 'Update Store', value: 'updateStore' },
  { name: 'Get Store Refresh Status', value: 'getStoreRefreshStatus' },
  { name: 'Refresh Store', value: 'refreshStore' },
  { name: 'Deactivate Store', value: 'deactivateStore' },
];

export const WAREHOUSE_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Warehouses', value: 'listWarehouses' },
  { name: 'Get Warehouse', value: 'getWarehouse' },
  { name: 'Create Warehouse', value: 'createWarehouse' },
  { name: 'Update Warehouse', value: 'updateWarehouse' },
  { name: 'Delete Warehouse', value: 'deleteWarehouse' },
  { name: 'List Inventory Warehouses (V2)', value: 'listInventoryWarehouses' },
];

export const PRODUCT_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Products', value: 'listProducts' },
  { name: 'Get Product', value: 'getProduct' },
  { name: 'Update Product', value: 'updateProduct' },
  { name: 'List Products by Tag', value: 'listProductsByTag' },
  { name: 'Add Tag to Product', value: 'addTagToProduct' },
  { name: 'Remove Tag from Product', value: 'removeTagFromProduct' },
];

export const FULFILLMENT_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Fulfillments', value: 'listFulfillments' },
  { name: 'Get Fulfillment', value: 'getFulfillment' },
];

export const INVENTORY_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Inventory (V2)', value: 'listInventory' },
  { name: 'Get Inventory (V2)', value: 'getInventory' },
  { name: 'Update Inventory (V2)', value: 'updateInventory' },
  { name: 'Adjust Inventory (V2)', value: 'adjustInventory' },
  { name: 'Set Inventory Quantity (V2)', value: 'setInventoryQuantity' },
  { name: 'List Inventory by Warehouse (V2)', value: 'listInventoryByWarehouse' },
];

export const ADDRESS_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Validate Address', value: 'validateAddress' },
  { name: 'Parse Address', value: 'parseAddress' },
];

export const TAG_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Tags', value: 'listTags' },
];

export const USER_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Users', value: 'listUsers' },
];

export const WEBHOOK_OPERATIONS: INodePropertyOptions[] = [
  { name: 'List Webhooks', value: 'listWebhooks' },
  { name: 'Create Webhook', value: 'createWebhook' },
  { name: 'Delete Webhook', value: 'deleteWebhook' },
];

export const MANIFEST_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Manifest (V2)', value: 'createManifest' },
  { name: 'List Manifests (V2)', value: 'listManifests' },
  { name: 'Get Manifest (V2)', value: 'getManifest' },
];

export const PICKUP_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Schedule Pickup (V2)', value: 'schedulePickup' },
  { name: 'List Pickups (V2)', value: 'listPickups' },
  { name: 'Cancel Pickup (V2)', value: 'cancelPickup' },
];

export const BATCH_OPERATIONS: INodePropertyOptions[] = [
  { name: 'Create Batch (V2)', value: 'createBatch' },
  { name: 'Get Batch (V2)', value: 'getBatch' },
  { name: 'List Batches (V2)', value: 'listBatches' },
  { name: 'Add to Batch (V2)', value: 'addToBatch' },
  { name: 'Remove from Batch (V2)', value: 'removeFromBatch' },
  { name: 'Process Batch (V2)', value: 'processBatch' },
];

export const ORDER_STATUSES = [
  { name: 'Awaiting Payment', value: 'awaiting_payment' },
  { name: 'Awaiting Shipment', value: 'awaiting_shipment' },
  { name: 'On Hold', value: 'on_hold' },
  { name: 'Shipped', value: 'shipped' },
  { name: 'Cancelled', value: 'cancelled' },
];

export const CONFIRMATION_TYPES = [
  { name: 'None', value: 'none' },
  { name: 'Delivery', value: 'delivery' },
  { name: 'Signature', value: 'signature' },
  { name: 'Adult Signature', value: 'adult_signature' },
  { name: 'Direct Signature', value: 'direct_signature' },
];

export const LABEL_FORMATS = [
  { name: 'PDF', value: 'pdf' },
  { name: 'PNG', value: 'png' },
  { name: 'ZPL', value: 'zpl' },
];

export const WEBHOOK_EVENTS = [
  { name: 'Order Created', value: 'ORDER_NOTIFY' },
  { name: 'Order Shipped', value: 'SHIP_NOTIFY' },
  { name: 'Item Shipped', value: 'ITEM_SHIP_NOTIFY' },
  { name: 'Item Order Notify', value: 'ITEM_ORDER_NOTIFY' },
  { name: 'Fulfillment Shipped', value: 'FULFILLMENT_SHIPPED' },
  { name: 'Fulfillment Rejected', value: 'FULFILLMENT_REJECTED' },
];

export const WEIGHT_UNITS = [
  { name: 'Ounces', value: 'ounces' },
  { name: 'Pounds', value: 'pounds' },
  { name: 'Grams', value: 'grams' },
  { name: 'Kilograms', value: 'kilograms' },
];

export const DIMENSION_UNITS = [
  { name: 'Inches', value: 'inches' },
  { name: 'Centimeters', value: 'centimeters' },
];

export const COUNTRIES = [
  { name: 'United States', value: 'US' },
  { name: 'Canada', value: 'CA' },
  { name: 'United Kingdom', value: 'GB' },
  { name: 'Australia', value: 'AU' },
  { name: 'Germany', value: 'DE' },
  { name: 'France', value: 'FR' },
  { name: 'Mexico', value: 'MX' },
  { name: 'Japan', value: 'JP' },
  { name: 'China', value: 'CN' },
  { name: 'India', value: 'IN' },
];
