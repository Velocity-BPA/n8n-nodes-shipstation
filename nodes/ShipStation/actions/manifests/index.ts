/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, buildQueryString } from '../../transport';

export const manifestsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['manifests'],
      },
    },
    options: [
      { name: 'Create Manifest', value: 'createManifest', action: 'Create a manifest' },
      { name: 'Get Manifest', value: 'getManifest', action: 'Get a manifest' },
      { name: 'List Manifests', value: 'listManifests', action: 'List manifests' },
    ],
    default: 'listManifests',
  },
];

export const manifestsFields: INodeProperties[] = [
  // V2 Notice
  {
    displayName: 'Manifest operations require API V2. Ensure your credentials are configured for V2.',
    name: 'manifestNotice',
    type: 'notice',
    default: '',
    displayOptions: {
      show: {
        resource: ['manifests'],
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
        resource: ['manifests'],
        operation: ['listManifests'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: { minValue: 1, maxValue: 100 },
    displayOptions: {
      show: {
        resource: ['manifests'],
        operation: ['listManifests'],
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
        resource: ['manifests'],
        operation: ['listManifests'],
      },
    },
    options: [
      { displayName: 'Warehouse ID', name: 'warehouse_id', type: 'string', default: '' },
      { displayName: 'Carrier ID', name: 'carrier_id', type: 'string', default: '' },
      { displayName: 'Ship Date Start', name: 'ship_date_start', type: 'dateTime', default: '' },
      { displayName: 'Ship Date End', name: 'ship_date_end', type: 'dateTime', default: '' },
      { displayName: 'Created At Start', name: 'created_at_start', type: 'dateTime', default: '' },
      { displayName: 'Created At End', name: 'created_at_end', type: 'dateTime', default: '' },
    ],
  },
  // Manifest ID
  {
    displayName: 'Manifest ID',
    name: 'manifestId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the manifest',
    displayOptions: {
      show: {
        resource: ['manifests'],
        operation: ['getManifest'],
      },
    },
  },
  // Create Manifest Fields
  {
    displayName: 'Carrier ID',
    name: 'carrierId',
    type: 'string',
    required: true,
    default: '',
    description: 'The carrier ID for the manifest',
    displayOptions: {
      show: {
        resource: ['manifests'],
        operation: ['createManifest'],
      },
    },
  },
  {
    displayName: 'Warehouse ID',
    name: 'warehouseId',
    type: 'string',
    required: true,
    default: '',
    description: 'The warehouse ID for the manifest',
    displayOptions: {
      show: {
        resource: ['manifests'],
        operation: ['createManifest'],
      },
    },
  },
  {
    displayName: 'Ship Date',
    name: 'shipDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'The ship date for the manifest',
    displayOptions: {
      show: {
        resource: ['manifests'],
        operation: ['createManifest'],
      },
    },
  },
  {
    displayName: 'Excluded Label IDs',
    name: 'excludedLabelIds',
    type: 'string',
    default: '',
    description: 'Comma-separated list of label IDs to exclude from the manifest',
    displayOptions: {
      show: {
        resource: ['manifests'],
        operation: ['createManifest'],
      },
    },
  },
];

export async function executeManifestOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listManifests': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        const allItems: IDataObject[] = [];
        let cursor: string | undefined;
        
        do {
          if (cursor) {
            qs.cursor = cursor;
          }
          qs.page_size = 100;
          
          const response = await shipStationApiRequest.call(
            this, 'GET', '/manifests', {}, qs, 'V2',
          ) as IDataObject;
          
          const items = (response.manifests as IDataObject[]) || [];
          allItems.push(...items);
          cursor = response.cursor as string | undefined;
        } while (cursor);
        
        responseData = allItems;
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.page_size = limit;
        const response = await shipStationApiRequest.call(
          this, 'GET', '/manifests', {}, qs, 'V2',
        ) as IDataObject;
        responseData = (response.manifests as IDataObject[]) || [];
      }
      break;
    }

    case 'getManifest': {
      const manifestId = this.getNodeParameter('manifestId', i) as string;
      responseData = await shipStationApiRequest.call(
        this, 'GET', `/manifests/${manifestId}`, {}, {}, 'V2',
      ) as IDataObject;
      break;
    }

    case 'createManifest': {
      const carrierId = this.getNodeParameter('carrierId', i) as string;
      const warehouseId = this.getNodeParameter('warehouseId', i) as string;
      const shipDate = this.getNodeParameter('shipDate', i) as string;
      const excludedLabelIdsStr = this.getNodeParameter('excludedLabelIds', i, '') as string;

      const body: IDataObject = {
        carrier_id: carrierId,
        warehouse_id: warehouseId,
        ship_date: shipDate,
      };

      if (excludedLabelIdsStr) {
        body.excluded_label_ids = excludedLabelIdsStr.split(',').map(id => id.trim());
      }

      responseData = await shipStationApiRequest.call(
        this, 'POST', '/manifests', body, {}, 'V2',
      ) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
