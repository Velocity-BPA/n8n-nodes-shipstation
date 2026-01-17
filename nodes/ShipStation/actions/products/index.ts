/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems, buildQueryString } from '../../transport';
import { cleanObject } from '../../utils';

export const productsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['products'],
      },
    },
    options: [
      { name: 'Add Tag to Product', value: 'addTagToProduct', action: 'Add tag to product' },
      { name: 'Get Product', value: 'getProduct', action: 'Get a product' },
      { name: 'List Products', value: 'listProducts', action: 'List products' },
      { name: 'List Products by Tag', value: 'listProductsByTag', action: 'List products by tag' },
      { name: 'Remove Tag from Product', value: 'removeTagFromProduct', action: 'Remove tag from product' },
      { name: 'Update Product', value: 'updateProduct', action: 'Update a product' },
    ],
    default: 'listProducts',
  },
];

export const productsFields: INodeProperties[] = [
  // Return All
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['products'],
        operation: ['listProducts', 'listProductsByTag'],
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
        resource: ['products'],
        operation: ['listProducts', 'listProductsByTag'],
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
        resource: ['products'],
        operation: ['listProducts'],
      },
    },
    options: [
      { displayName: 'SKU', name: 'sku', type: 'string', default: '' },
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Product Category ID', name: 'productCategoryId', type: 'number', default: 0 },
      { displayName: 'Product Type ID', name: 'productTypeId', type: 'number', default: 0 },
      { displayName: 'Tag ID', name: 'tagId', type: 'number', default: 0 },
      { displayName: 'Start Date', name: 'startDate', type: 'dateTime', default: '' },
      { displayName: 'End Date', name: 'endDate', type: 'dateTime', default: '' },
      { displayName: 'Include Inactive', name: 'includeInactive', type: 'boolean', default: false },
      { displayName: 'Sort By', name: 'sortBy', type: 'options', options: [
        { name: 'SKU', value: 'SKU' },
        { name: 'Modify Date', value: 'ModifyDate' },
        { name: 'Create Date', value: 'CreateDate' },
      ], default: 'SKU' },
      { displayName: 'Sort Direction', name: 'sortDir', type: 'options', options: [
        { name: 'Ascending', value: 'ASC' },
        { name: 'Descending', value: 'DESC' },
      ], default: 'ASC' },
    ],
  },
  // Product ID
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the product',
    displayOptions: {
      show: {
        resource: ['products'],
        operation: ['getProduct', 'updateProduct', 'addTagToProduct', 'removeTagFromProduct'],
      },
    },
  },
  // Tag ID
  {
    displayName: 'Tag ID',
    name: 'tagId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the tag',
    displayOptions: {
      show: {
        resource: ['products'],
        operation: ['addTagToProduct', 'removeTagFromProduct', 'listProductsByTag'],
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
        resource: ['products'],
        operation: ['updateProduct'],
      },
    },
    options: [
      { displayName: 'SKU', name: 'sku', type: 'string', default: '' },
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Price', name: 'price', type: 'number', default: 0 },
      { displayName: 'Default Cost', name: 'defaultCost', type: 'number', default: 0 },
      { displayName: 'Length', name: 'length', type: 'number', default: 0 },
      { displayName: 'Width', name: 'width', type: 'number', default: 0 },
      { displayName: 'Height', name: 'height', type: 'number', default: 0 },
      { displayName: 'Weight (oz)', name: 'weightOz', type: 'number', default: 0 },
      { displayName: 'Internal Notes', name: 'internalNotes', type: 'string', default: '' },
      { displayName: 'Fulfillment SKU', name: 'fulfillmentSku', type: 'string', default: '' },
      { displayName: 'Active', name: 'active', type: 'boolean', default: true },
      { displayName: 'Product Category ID', name: 'productCategoryId', type: 'number', default: 0 },
      { displayName: 'Product Type ID', name: 'productTypeId', type: 'number', default: 0 },
      { displayName: 'Warehouse Location', name: 'warehouseLocation', type: 'string', default: '' },
      { displayName: 'Default Carrier Code', name: 'defaultCarrierCode', type: 'string', default: '' },
      { displayName: 'Default Service Code', name: 'defaultServiceCode', type: 'string', default: '' },
      { displayName: 'Default Package Code', name: 'defaultPackageCode', type: 'string', default: '' },
      { displayName: 'Default Int\'l Carrier Code', name: 'defaultIntlCarrierCode', type: 'string', default: '' },
      { displayName: 'Default Int\'l Service Code', name: 'defaultIntlServiceCode', type: 'string', default: '' },
      { displayName: 'Default Int\'l Package Code', name: 'defaultIntlPackageCode', type: 'string', default: '' },
      { displayName: 'Default Confirmation', name: 'defaultConfirmation', type: 'string', default: '' },
      { displayName: 'Default Int\'l Confirmation', name: 'defaultIntlConfirmation', type: 'string', default: '' },
      { displayName: 'Customs Description', name: 'customsDescription', type: 'string', default: '' },
      { displayName: 'Customs Value', name: 'customsValue', type: 'number', default: 0 },
      { displayName: 'Customs Tariff No', name: 'customsTariffNo', type: 'string', default: '' },
      { displayName: 'Customs Country Code', name: 'customsCountryCode', type: 'string', default: '' },
      { displayName: 'No Customs', name: 'noCustoms', type: 'boolean', default: false },
    ],
  },
];

export async function executeProductOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listProducts': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/products', 'products', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/products', {}, qs) as IDataObject;
        responseData = (response.products as IDataObject[]) || [];
      }
      break;
    }

    case 'getProduct': {
      const productId = this.getNodeParameter('productId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'GET', `/products/${productId}`) as IDataObject;
      break;
    }

    case 'updateProduct': {
      const productId = this.getNodeParameter('productId', i) as number;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {
        productId,
        ...updateFields,
      };

      responseData = await shipStationApiRequest.call(this, 'PUT', `/products/${productId}`, cleanObject(body)) as IDataObject;
      break;
    }

    case 'listProductsByTag': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const tagId = this.getNodeParameter('tagId', i) as number;
      const qs: IDataObject = { tagId };

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/products', 'products', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/products', {}, qs) as IDataObject;
        responseData = (response.products as IDataObject[]) || [];
      }
      break;
    }

    case 'addTagToProduct': {
      const productId = this.getNodeParameter('productId', i) as number;
      const tagId = this.getNodeParameter('tagId', i) as number;

      // First get the product
      const product = await shipStationApiRequest.call(this, 'GET', `/products/${productId}`) as IDataObject;
      
      // Add the tag
      const tags = (product.tags as number[]) || [];
      if (!tags.includes(tagId)) {
        tags.push(tagId);
      }

      responseData = await shipStationApiRequest.call(this, 'PUT', `/products/${productId}`, { 
        productId, 
        tags,
      }) as IDataObject;
      break;
    }

    case 'removeTagFromProduct': {
      const productId = this.getNodeParameter('productId', i) as number;
      const tagId = this.getNodeParameter('tagId', i) as number;

      // First get the product
      const product = await shipStationApiRequest.call(this, 'GET', `/products/${productId}`) as IDataObject;
      
      // Remove the tag
      const tags = ((product.tags as number[]) || []).filter(t => t !== tagId);

      responseData = await shipStationApiRequest.call(this, 'PUT', `/products/${productId}`, { 
        productId, 
        tags,
      }) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
