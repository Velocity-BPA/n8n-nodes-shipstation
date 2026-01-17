/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IWebhookFunctions,
  IWebhookResponseData,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  NodeApiError,
  JsonObject,
} from 'n8n-workflow';

import { shipStationApiRequest } from './transport';
import { logLicensingNotice } from './utils';

export class ShipStationTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'ShipStation Trigger',
    name: 'shipStationTrigger',
    icon: 'file:shipstation.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Handle ShipStation webhook events',
    defaults: {
      name: 'ShipStation Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'shipStationApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        default: 'ORDER_NOTIFY',
        options: [
          {
            name: 'Order Created/Updated',
            value: 'ORDER_NOTIFY',
            description: 'Triggered when an order is created or updated',
          },
          {
            name: 'Shipment Created',
            value: 'SHIP_NOTIFY',
            description: 'Triggered when a shipment is created',
          },
          {
            name: 'Item Order Notify',
            value: 'ITEM_ORDER_NOTIFY',
            description: 'Triggered for item-level order events',
          },
          {
            name: 'Item Ship Notify',
            value: 'ITEM_SHIP_NOTIFY',
            description: 'Triggered for item-level shipment events',
          },
          {
            name: 'Fulfillment Shipped',
            value: 'FULFILLMENT_SHIPPED',
            description: 'Triggered when a fulfillment is shipped',
          },
          {
            name: 'Fulfillment Rejected',
            value: 'FULFILLMENT_REJECTED',
            description: 'Triggered when a fulfillment is rejected',
          },
        ],
      },
      {
        displayName: 'Store ID',
        name: 'storeId',
        type: 'string',
        default: '',
        description: 'Optional store ID to filter webhook events. Leave empty to receive events from all stores.',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Friendly Name',
            name: 'friendlyName',
            type: 'string',
            default: '',
            description: 'A friendly name for this webhook in ShipStation',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice();

        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const event = this.getNodeParameter('event') as string;

        try {
          const webhooks = await shipStationApiRequest.call(
            this,
            'GET',
            '/webhooks',
          ) as IDataObject;

          const webhooksList = (webhooks.webhooks as IDataObject[]) || [];

          for (const webhook of webhooksList) {
            if (webhook.Url === webhookUrl && webhook.HookType === event) {
              const webhookData = this.getWorkflowStaticData('node');
              webhookData.webhookId = webhook.WebHookID;
              return true;
            }
          }
        } catch (error) {
          // If unable to check, assume it doesn't exist
          return false;
        }

        return false;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice();

        const webhookUrl = this.getNodeWebhookUrl('default') as string;
        const event = this.getNodeParameter('event') as string;
        const storeId = this.getNodeParameter('storeId') as string;
        const options = this.getNodeParameter('options') as IDataObject;

        const body: IDataObject = {
          target_url: webhookUrl,
          event,
          store_id: storeId || null,
          friendly_name: options.friendlyName || `n8n Webhook - ${event}`,
        };

        try {
          const response = await shipStationApiRequest.call(
            this,
            'POST',
            '/webhooks/subscribe',
            body,
          ) as IDataObject;

          if (response.id) {
            const webhookData = this.getWorkflowStaticData('node');
            webhookData.webhookId = response.id;
            return true;
          }
        } catch (error) {
          throw new NodeApiError(this.getNode(), { message: 'Failed to create ShipStation webhook' } as JsonObject);
        }

        return false;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice();

        const webhookData = this.getWorkflowStaticData('node');
        const webhookId = webhookData.webhookId as number;

        if (!webhookId) {
          return true;
        }

        try {
          await shipStationApiRequest.call(
            this,
            'DELETE',
            `/webhooks/${webhookId}`,
          );
          delete webhookData.webhookId;
          return true;
        } catch (error) {
          // If webhook doesn't exist, consider it deleted
          const err = error as NodeApiError;
          if (err.httpCode === '404') {
            delete webhookData.webhookId;
            return true;
          }
          throw error;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    logLicensingNotice();

    const req = this.getRequestObject();
    const body = this.getBodyData() as IDataObject;

    // Build a clean response object
    const responseObject: JsonObject = {
      event: (body.resource_type as string) || 'unknown',
      resource_url: (body.resource_url as string) || '',
      timestamp: new Date().toISOString(),
    };

    // Add headers if present
    if (req.headers) {
      responseObject.headers = JSON.parse(JSON.stringify(req.headers));
    }

    // Add body data
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null) {
        responseObject[key] = value as string | number | boolean;
      }
    }

    return {
      workflowData: [
        this.helpers.returnJsonArray(responseObject),
      ],
    };
  }
}
