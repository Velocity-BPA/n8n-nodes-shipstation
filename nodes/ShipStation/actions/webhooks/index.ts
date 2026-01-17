/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest } from '../../transport';
import { WEBHOOK_EVENTS } from '../../constants';

export const webhooksOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['webhooks'],
      },
    },
    options: [
      { name: 'Create Webhook', value: 'createWebhook', action: 'Create a webhook' },
      { name: 'Delete Webhook', value: 'deleteWebhook', action: 'Delete a webhook' },
      { name: 'List Webhooks', value: 'listWebhooks', action: 'List webhooks' },
    ],
    default: 'listWebhooks',
  },
];

export const webhooksFields: INodeProperties[] = [
  // Webhook ID for delete
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the webhook to delete',
    displayOptions: {
      show: {
        resource: ['webhooks'],
        operation: ['deleteWebhook'],
      },
    },
  },
  // Create Webhook Fields
  {
    displayName: 'Target URL',
    name: 'targetUrl',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://your-server.com/webhook',
    description: 'The URL that ShipStation will POST webhook events to',
    displayOptions: {
      show: {
        resource: ['webhooks'],
        operation: ['createWebhook'],
      },
    },
  },
  {
    displayName: 'Event',
    name: 'event',
    type: 'options',
    required: true,
    default: 'ORDER_NOTIFY',
    description: 'The type of event to subscribe to',
    options: WEBHOOK_EVENTS,
    displayOptions: {
      show: {
        resource: ['webhooks'],
        operation: ['createWebhook'],
      },
    },
  },
  {
    displayName: 'Store ID',
    name: 'storeId',
    type: 'number',
    default: 0,
    description: 'Optional store ID to filter events. Leave empty for all stores.',
    displayOptions: {
      show: {
        resource: ['webhooks'],
        operation: ['createWebhook'],
      },
    },
  },
  {
    displayName: 'Friendly Name',
    name: 'friendlyName',
    type: 'string',
    default: '',
    description: 'A friendly name for this webhook subscription',
    displayOptions: {
      show: {
        resource: ['webhooks'],
        operation: ['createWebhook'],
      },
    },
  },
];

export async function executeWebhookOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listWebhooks': {
      const response = await shipStationApiRequest.call(this, 'GET', '/webhooks') as IDataObject;
      responseData = (response.webhooks as IDataObject[]) || [];
      break;
    }

    case 'createWebhook': {
      const targetUrl = this.getNodeParameter('targetUrl', i) as string;
      const event = this.getNodeParameter('event', i) as string;
      const storeId = this.getNodeParameter('storeId', i, 0) as number;
      const friendlyName = this.getNodeParameter('friendlyName', i, '') as string;

      const body: IDataObject = {
        target_url: targetUrl,
        event,
      };

      if (storeId) {
        body.store_id = storeId;
      }

      if (friendlyName) {
        body.friendly_name = friendlyName;
      }

      responseData = await shipStationApiRequest.call(
        this, 'POST', '/webhooks/subscribe', body,
      ) as IDataObject;
      break;
    }

    case 'deleteWebhook': {
      const webhookId = this.getNodeParameter('webhookId', i) as number;
      
      await shipStationApiRequest.call(
        this, 'DELETE', `/webhooks/${webhookId}`,
      );
      
      responseData = { success: true, webhookId };
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
