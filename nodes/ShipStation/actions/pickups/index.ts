/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems } from '../../transport';

export const pickupsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['pickups'],
      },
    },
    options: [
      { name: 'Cancel Pickup', value: 'cancelPickup', action: 'Cancel a scheduled pickup' },
      { name: 'Get Pickup', value: 'getPickup', action: 'Get pickup details' },
      { name: 'List Pickups', value: 'listPickups', action: 'List all pickups' },
      { name: 'Schedule Pickup', value: 'schedulePickup', action: 'Schedule a carrier pickup' },
    ],
    default: 'listPickups',
  },
];

export const pickupsFields: INodeProperties[] = [
  // Pickup ID
  {
    displayName: 'Pickup ID',
    name: 'pickupId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the pickup',
    displayOptions: {
      show: {
        resource: ['pickups'],
        operation: ['getPickup', 'cancelPickup'],
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
        resource: ['pickups'],
        operation: ['listPickups'],
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
        resource: ['pickups'],
        operation: ['listPickups'],
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
        resource: ['pickups'],
        operation: ['listPickups'],
      },
    },
    options: [
      { displayName: 'Carrier Code', name: 'carrier_code', type: 'string', default: '' },
      { displayName: 'Warehouse ID', name: 'warehouse_id', type: 'string', default: '' },
      { displayName: 'Created After', name: 'created_at_start', type: 'dateTime', default: '' },
      { displayName: 'Created Before', name: 'created_at_end', type: 'dateTime', default: '' },
    ],
  },
  // Schedule Pickup Fields
  {
    displayName: 'Carrier Code',
    name: 'carrierCode',
    type: 'string',
    required: true,
    default: '',
    description: 'The carrier code for the pickup (e.g., ups, fedex)',
    displayOptions: {
      show: {
        resource: ['pickups'],
        operation: ['schedulePickup'],
      },
    },
  },
  {
    displayName: 'Pickup Date',
    name: 'pickupDate',
    type: 'dateTime',
    required: true,
    default: '',
    description: 'The date for the pickup',
    displayOptions: {
      show: {
        resource: ['pickups'],
        operation: ['schedulePickup'],
      },
    },
  },
  {
    displayName: 'Pickup Window',
    name: 'pickupWindow',
    type: 'collection',
    placeholder: 'Set Pickup Window',
    default: {},
    displayOptions: {
      show: {
        resource: ['pickups'],
        operation: ['schedulePickup'],
      },
    },
    options: [
      { displayName: 'Start Time', name: 'start_time', type: 'string', default: '09:00', description: 'Pickup window start time (HH:MM)' },
      { displayName: 'End Time', name: 'end_time', type: 'string', default: '17:00', description: 'Pickup window end time (HH:MM)' },
    ],
  },
  {
    displayName: 'Pickup Address',
    name: 'pickupAddress',
    type: 'collection',
    placeholder: 'Set Pickup Address',
    default: {},
    displayOptions: {
      show: {
        resource: ['pickups'],
        operation: ['schedulePickup'],
      },
    },
    options: [
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Company', name: 'company', type: 'string', default: '' },
      { displayName: 'Phone', name: 'phone', type: 'string', default: '' },
      { displayName: 'Address Line 1', name: 'address_line1', type: 'string', default: '' },
      { displayName: 'Address Line 2', name: 'address_line2', type: 'string', default: '' },
      { displayName: 'City', name: 'city_locality', type: 'string', default: '' },
      { displayName: 'State/Province', name: 'state_province', type: 'string', default: '' },
      { displayName: 'Postal Code', name: 'postal_code', type: 'string', default: '' },
      { displayName: 'Country Code', name: 'country_code', type: 'string', default: 'US' },
    ],
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['pickups'],
        operation: ['schedulePickup'],
      },
    },
    options: [
      { displayName: 'Contact Name', name: 'contact_name', type: 'string', default: '' },
      { displayName: 'Contact Phone', name: 'contact_phone', type: 'string', default: '' },
      { displayName: 'Contact Email', name: 'contact_email', type: 'string', default: '' },
      { displayName: 'Total Weight (oz)', name: 'total_weight', type: 'number', default: 0 },
      { displayName: 'Package Count', name: 'package_count', type: 'number', default: 1 },
      { displayName: 'Special Instructions', name: 'special_instructions', type: 'string', default: '' },
    ],
  },
];

export async function executePickupOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listPickups': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs: IDataObject = { ...filters };

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/pickups', 'pickups', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.page_size = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/pickups', {}, qs) as IDataObject;
        responseData = (response.pickups as IDataObject[]) || [];
      }
      break;
    }

    case 'getPickup': {
      const pickupId = this.getNodeParameter('pickupId', i) as string;
      responseData = await shipStationApiRequest.call(this, 'GET', `/pickups/${pickupId}`) as IDataObject;
      break;
    }

    case 'schedulePickup': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const pickupDate = this.getNodeParameter('pickupDate', i) as string;
      const pickupWindow = this.getNodeParameter('pickupWindow', i) as IDataObject;
      const pickupAddress = this.getNodeParameter('pickupAddress', i) as IDataObject;
      const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

      const body: IDataObject = {
        carrier_code: carrierCode,
        pickup_date: pickupDate.split('T')[0],
      };

      if (Object.keys(pickupWindow).length > 0) {
        body.pickup_window = pickupWindow;
      }

      if (Object.keys(pickupAddress).length > 0) {
        body.pickup_address = pickupAddress;
      }

      if (additionalOptions.contact_name) body.contact_name = additionalOptions.contact_name;
      if (additionalOptions.contact_phone) body.contact_phone = additionalOptions.contact_phone;
      if (additionalOptions.contact_email) body.contact_email = additionalOptions.contact_email;
      if (additionalOptions.total_weight) body.total_weight = { value: additionalOptions.total_weight, unit: 'ounce' };
      if (additionalOptions.package_count) body.package_count = additionalOptions.package_count;
      if (additionalOptions.special_instructions) body.special_instructions = additionalOptions.special_instructions;

      responseData = await shipStationApiRequest.call(this, 'POST', '/pickups', body) as IDataObject;
      break;
    }

    case 'cancelPickup': {
      const pickupId = this.getNodeParameter('pickupId', i) as string;
      responseData = await shipStationApiRequest.call(this, 'DELETE', `/pickups/${pickupId}`) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
