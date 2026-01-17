/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems } from '../../transport';

export const batchesOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['batches'],
      },
    },
    options: [
      { name: 'Add Shipments to Batch', value: 'addToBatch', action: 'Add shipments to a batch' },
      { name: 'Create Batch', value: 'createBatch', action: 'Create a new batch' },
      { name: 'Delete Batch', value: 'deleteBatch', action: 'Delete a batch' },
      { name: 'Get Batch', value: 'getBatch', action: 'Get batch details' },
      { name: 'List Batches', value: 'listBatches', action: 'List all batches' },
      { name: 'Process Batch', value: 'processBatch', action: 'Process labels for a batch' },
      { name: 'Remove Shipments from Batch', value: 'removeFromBatch', action: 'Remove shipments from a batch' },
    ],
    default: 'listBatches',
  },
];

export const batchesFields: INodeProperties[] = [
  // Batch ID
  {
    displayName: 'Batch ID',
    name: 'batchId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the batch',
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['getBatch', 'deleteBatch', 'addToBatch', 'removeFromBatch', 'processBatch'],
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
        resource: ['batches'],
        operation: ['listBatches'],
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
        resource: ['batches'],
        operation: ['listBatches'],
        returnAll: [false],
      },
    },
  },
  // List Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['listBatches'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Open', value: 'open' },
          { name: 'Processing', value: 'processing' },
          { name: 'Completed', value: 'completed' },
          { name: 'Completed With Errors', value: 'completed_with_errors' },
          { name: 'Archived', value: 'archived' },
          { name: 'Invalid', value: 'invalid' },
        ],
        default: 'open',
      },
      { displayName: 'Sort By', name: 'sort_by', type: 'string', default: '' },
      {
        displayName: 'Sort Direction',
        name: 'sort_dir',
        type: 'options',
        options: [
          { name: 'Ascending', value: 'asc' },
          { name: 'Descending', value: 'desc' },
        ],
        default: 'desc',
      },
    ],
  },
  // Create Batch Fields
  {
    displayName: 'Batch Name',
    name: 'batchName',
    type: 'string',
    required: true,
    default: '',
    description: 'The name for the new batch',
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['createBatch'],
      },
    },
  },
  {
    displayName: 'Shipment IDs',
    name: 'shipmentIds',
    type: 'string',
    default: '',
    description: 'Comma-separated list of shipment IDs to add to the batch',
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['createBatch', 'addToBatch', 'removeFromBatch'],
      },
    },
  },
  {
    displayName: 'Rate IDs',
    name: 'rateIds',
    type: 'string',
    default: '',
    description: 'Comma-separated list of rate IDs to add to the batch',
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['createBatch', 'addToBatch'],
      },
    },
  },
  // Process Batch Options
  {
    displayName: 'Process Options',
    name: 'processOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['processBatch'],
      },
    },
    options: [
      { displayName: 'Ship Date', name: 'ship_date', type: 'dateTime', default: '' },
      {
        displayName: 'Label Format',
        name: 'label_format',
        type: 'options',
        options: [
          { name: 'PDF', value: 'pdf' },
          { name: 'PNG', value: 'png' },
          { name: 'ZPL', value: 'zpl' },
        ],
        default: 'pdf',
      },
      {
        displayName: 'Label Layout',
        name: 'label_layout',
        type: 'options',
        options: [
          { name: '4x6', value: '4x6' },
          { name: 'Letter', value: 'letter' },
        ],
        default: '4x6',
      },
      { displayName: 'Display Scheme', name: 'display_scheme', type: 'string', default: '' },
    ],
  },
  // Create Batch Additional Options
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['batches'],
        operation: ['createBatch'],
      },
    },
    options: [
      { displayName: 'External Batch ID', name: 'external_batch_id', type: 'string', default: '' },
      { displayName: 'Batch Notes', name: 'batch_notes', type: 'string', default: '' },
    ],
  },
];

export async function executeBatchOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listBatches': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = { ...filters };

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/batches', 'batches', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.page_size = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/batches', {}, qs) as IDataObject;
        responseData = (response.batches as IDataObject[]) || [];
      }
      break;
    }

    case 'getBatch': {
      const batchId = this.getNodeParameter('batchId', i) as string;
      responseData = await shipStationApiRequest.call(this, 'GET', `/batches/${batchId}`) as IDataObject;
      break;
    }

    case 'createBatch': {
      const batchName = this.getNodeParameter('batchName', i) as string;
      const shipmentIds = this.getNodeParameter('shipmentIds', i) as string;
      const rateIds = this.getNodeParameter('rateIds', i) as string;
      const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

      const body: IDataObject = {
        batch_name: batchName,
      };

      if (shipmentIds) {
        body.shipment_ids = shipmentIds.split(',').map(id => id.trim());
      }

      if (rateIds) {
        body.rate_ids = rateIds.split(',').map(id => id.trim());
      }

      if (additionalOptions.external_batch_id) body.external_batch_id = additionalOptions.external_batch_id;
      if (additionalOptions.batch_notes) body.batch_notes = additionalOptions.batch_notes;

      responseData = await shipStationApiRequest.call(this, 'POST', '/batches', body) as IDataObject;
      break;
    }

    case 'deleteBatch': {
      const batchId = this.getNodeParameter('batchId', i) as string;
      responseData = await shipStationApiRequest.call(this, 'DELETE', `/batches/${batchId}`) as IDataObject;
      break;
    }

    case 'addToBatch': {
      const batchId = this.getNodeParameter('batchId', i) as string;
      const shipmentIds = this.getNodeParameter('shipmentIds', i) as string;
      const rateIds = this.getNodeParameter('rateIds', i) as string;

      const body: IDataObject = {};

      if (shipmentIds) {
        body.shipment_ids = shipmentIds.split(',').map(id => id.trim());
      }

      if (rateIds) {
        body.rate_ids = rateIds.split(',').map(id => id.trim());
      }

      responseData = await shipStationApiRequest.call(this, 'POST', `/batches/${batchId}/add`, body) as IDataObject;
      break;
    }

    case 'removeFromBatch': {
      const batchId = this.getNodeParameter('batchId', i) as string;
      const shipmentIds = this.getNodeParameter('shipmentIds', i) as string;

      const body: IDataObject = {};

      if (shipmentIds) {
        body.shipment_ids = shipmentIds.split(',').map(id => id.trim());
      }

      responseData = await shipStationApiRequest.call(this, 'POST', `/batches/${batchId}/remove`, body) as IDataObject;
      break;
    }

    case 'processBatch': {
      const batchId = this.getNodeParameter('batchId', i) as string;
      const processOptions = this.getNodeParameter('processOptions', i) as IDataObject;

      const body: IDataObject = {};

      if (processOptions.ship_date) {
        const shipDate = processOptions.ship_date as string;
        body.ship_date = shipDate.split('T')[0];
      }
      if (processOptions.label_format) body.label_format = processOptions.label_format;
      if (processOptions.label_layout) body.label_layout = processOptions.label_layout;
      if (processOptions.display_scheme) body.display_scheme = processOptions.display_scheme;

      responseData = await shipStationApiRequest.call(this, 'POST', `/batches/${batchId}/process/labels`, body) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
