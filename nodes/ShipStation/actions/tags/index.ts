/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';

export const tagsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['tags'],
      },
    },
    options: [
      { name: 'List Tags', value: 'listTags', action: 'List all tags' },
    ],
    default: 'listTags',
  },
];

export const tagsFields: INodeProperties[] = [];

export async function executeTagOperations(
  this: IExecuteFunctions,
  operation: string,
  _i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listTags': {
      responseData = await shipStationApiRequest.call(this, 'GET', '/accounts/listtags') as IDataObject[];
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
