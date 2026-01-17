/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';

export const usersOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['users'],
      },
    },
    options: [
      { name: 'List Users', value: 'listUsers', action: 'List all users' },
    ],
    default: 'listUsers',
  },
];

export const usersFields: INodeProperties[] = [
  // Show inactive
  {
    displayName: 'Show Inactive',
    name: 'showInactive',
    type: 'boolean',
    default: false,
    description: 'Whether to include inactive users in the response',
    displayOptions: {
      show: {
        resource: ['users'],
        operation: ['listUsers'],
      },
    },
  },
];

export async function executeUserOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listUsers': {
      const showInactive = this.getNodeParameter('showInactive', i, false) as boolean;
      const qs: IDataObject = {};
      
      if (showInactive) {
        qs.showInactive = true;
      }
      
      responseData = await shipStationApiRequest.call(this, 'GET', '/users', {}, qs) as IDataObject[];
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
