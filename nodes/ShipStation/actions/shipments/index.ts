/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import { shipStationApiRequest, shipStationApiRequestAllItems, buildQueryString } from '../../transport';
import { cleanObject, formatDate, buildAddressObject, buildWeightObject, buildDimensionsObject } from '../../utils';
import { CONFIRMATION_TYPES, LABEL_FORMATS, COUNTRIES, WEIGHT_UNITS, DIMENSION_UNITS } from '../../constants';

export const shipmentsOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['shipments'],
      },
    },
    options: [
      { name: 'Create Label', value: 'createLabel', action: 'Create a shipping label' },
      { name: 'Create Label from Order', value: 'createLabelFromOrder', action: 'Create label from order' },
      { name: 'Create Label from Shipment', value: 'createLabelFromShipment', action: 'Create label from shipment' },
      { name: 'Create Return Label', value: 'createReturnLabel', action: 'Create a return label' },
      { name: 'Get Shipment', value: 'getShipment', action: 'Get a shipment' },
      { name: 'Get Shipment Rates', value: 'getShipmentRates', action: 'Get shipment rates' },
      { name: 'List Shipments', value: 'listShipments', action: 'List shipments' },
      { name: 'Void Label', value: 'voidLabel', action: 'Void a label' },
    ],
    default: 'listShipments',
  },
];

export const shipmentsFields: INodeProperties[] = [
  // List Shipments
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['listShipments'],
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
        resource: ['shipments'],
        operation: ['listShipments'],
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
        resource: ['shipments'],
        operation: ['listShipments'],
      },
    },
    options: [
      { displayName: 'Recipient Name', name: 'recipientName', type: 'string', default: '' },
      { displayName: 'Recipient Country Code', name: 'recipientCountryCode', type: 'string', default: '' },
      { displayName: 'Order Number', name: 'orderNumber', type: 'string', default: '' },
      { displayName: 'Order ID', name: 'orderId', type: 'number', default: 0 },
      { displayName: 'Carrier Code', name: 'carrierCode', type: 'string', default: '' },
      { displayName: 'Service Code', name: 'serviceCode', type: 'string', default: '' },
      { displayName: 'Tracking Number', name: 'trackingNumber', type: 'string', default: '' },
      { displayName: 'Create Date Start', name: 'createDateStart', type: 'dateTime', default: '' },
      { displayName: 'Create Date End', name: 'createDateEnd', type: 'dateTime', default: '' },
      { displayName: 'Ship Date Start', name: 'shipDateStart', type: 'dateTime', default: '' },
      { displayName: 'Ship Date End', name: 'shipDateEnd', type: 'dateTime', default: '' },
      { displayName: 'Voided', name: 'voided', type: 'boolean', default: false },
      { displayName: 'Include Shipment Items', name: 'includeShipmentItems', type: 'boolean', default: false },
      { displayName: 'Sort By', name: 'sortBy', type: 'options', options: [
        { name: 'Ship Date', value: 'ShipDate' },
        { name: 'Create Date', value: 'CreateDate' },
      ], default: 'ShipDate' },
      { displayName: 'Sort Direction', name: 'sortDir', type: 'options', options: [
        { name: 'Ascending', value: 'ASC' },
        { name: 'Descending', value: 'DESC' },
      ], default: 'DESC' },
    ],
  },
  // Get Shipment
  {
    displayName: 'Shipment ID',
    name: 'shipmentId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The ID of the shipment',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['getShipment', 'voidLabel'],
      },
    },
  },
  // Create Label fields
  {
    displayName: 'Carrier Code',
    name: 'carrierCode',
    type: 'string',
    required: true,
    default: '',
    description: 'The carrier code (e.g., stamps_com, fedex, ups)',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel', 'getShipmentRates'],
      },
    },
  },
  {
    displayName: 'Service Code',
    name: 'serviceCode',
    type: 'string',
    required: true,
    default: '',
    description: 'The service code for the carrier',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel'],
      },
    },
  },
  {
    displayName: 'Package Code',
    name: 'packageCode',
    type: 'string',
    default: 'package',
    description: 'The package type code',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel', 'getShipmentRates'],
      },
    },
  },
  // Ship From
  {
    displayName: 'Ship From',
    name: 'shipFrom',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    required: true,
    description: 'Origin address',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel', 'getShipmentRates'],
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
  // Ship To
  {
    displayName: 'Ship To',
    name: 'shipTo',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    required: true,
    description: 'Destination address',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel', 'getShipmentRates'],
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
  // Weight
  {
    displayName: 'Weight',
    name: 'weight',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    required: true,
    description: 'Package weight',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel', 'getShipmentRates'],
      },
    },
    options: [
      { displayName: 'Value', name: 'value', type: 'number', default: 0 },
      { displayName: 'Units', name: 'units', type: 'options', options: WEIGHT_UNITS, default: 'ounces' },
    ],
  },
  // Dimensions
  {
    displayName: 'Dimensions',
    name: 'dimensions',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    description: 'Package dimensions (optional)',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel', 'getShipmentRates'],
      },
    },
    options: [
      { displayName: 'Length', name: 'length', type: 'number', default: 0 },
      { displayName: 'Width', name: 'width', type: 'number', default: 0 },
      { displayName: 'Height', name: 'height', type: 'number', default: 0 },
      { displayName: 'Units', name: 'units', type: 'options', options: DIMENSION_UNITS, default: 'inches' },
    ],
  },
  // Label Options
  {
    displayName: 'Label Options',
    name: 'labelOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabel', 'createReturnLabel'],
      },
    },
    options: [
      { displayName: 'Confirmation', name: 'confirmation', type: 'options', options: CONFIRMATION_TYPES, default: 'none' },
      { displayName: 'Ship Date', name: 'shipDate', type: 'dateTime', default: '' },
      { displayName: 'Test Label', name: 'testLabel', type: 'boolean', default: false },
    ],
  },
  // Order ID for createLabelFromOrder
  {
    displayName: 'Order ID',
    name: 'orderId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The order ID to create a label for',
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabelFromOrder'],
      },
    },
  },
  // Create Label From Order Options
  {
    displayName: 'Label Options',
    name: 'orderLabelOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['shipments'],
        operation: ['createLabelFromOrder'],
      },
    },
    options: [
      { displayName: 'Carrier Code', name: 'carrierCode', type: 'string', default: '' },
      { displayName: 'Service Code', name: 'serviceCode', type: 'string', default: '' },
      { displayName: 'Package Code', name: 'packageCode', type: 'string', default: '' },
      { displayName: 'Confirmation', name: 'confirmation', type: 'options', options: CONFIRMATION_TYPES, default: 'none' },
      { displayName: 'Ship Date', name: 'shipDate', type: 'dateTime', default: '' },
      { displayName: 'Test Label', name: 'testLabel', type: 'boolean', default: false },
    ],
  },
];

export async function executeShipmentOperations(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<IDataObject | IDataObject[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'listShipments': {
      const returnAll = this.getNodeParameter('returnAll', i) as boolean;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const qs = buildQueryString(filters);

      if (returnAll) {
        responseData = await shipStationApiRequestAllItems.call(
          this, 'GET', '/shipments', 'shipments', {}, qs,
        );
      } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.pageSize = limit;
        qs.page = 1;
        const response = await shipStationApiRequest.call(this, 'GET', '/shipments', {}, qs) as IDataObject;
        responseData = (response.shipments as IDataObject[]) || [];
      }
      break;
    }

    case 'getShipment': {
      const shipmentId = this.getNodeParameter('shipmentId', i) as number;
      const qs: IDataObject = { shipmentId };
      const response = await shipStationApiRequest.call(this, 'GET', '/shipments', {}, qs) as IDataObject;
      responseData = (response.shipments as IDataObject[])?.[0] || {};
      break;
    }

    case 'createLabel': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const serviceCode = this.getNodeParameter('serviceCode', i) as string;
      const packageCode = this.getNodeParameter('packageCode', i) as string;
      const shipFrom = this.getNodeParameter('shipFrom', i) as IDataObject;
      const shipTo = this.getNodeParameter('shipTo', i) as IDataObject;
      const weight = this.getNodeParameter('weight', i) as IDataObject;
      const dimensions = this.getNodeParameter('dimensions', i) as IDataObject;
      const labelOptions = this.getNodeParameter('labelOptions', i) as IDataObject;

      const body: IDataObject = {
        carrierCode,
        serviceCode,
        packageCode,
        shipFrom: buildAddressObject(shipFrom),
        shipTo: buildAddressObject(shipTo),
        weight: buildWeightObject(weight),
        ...labelOptions,
      };

      if (dimensions && Object.keys(dimensions).length > 0) {
        body.dimensions = buildDimensionsObject(dimensions);
      }

      if (labelOptions.shipDate) {
        body.shipDate = formatDate(labelOptions.shipDate as string);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/createlabel', cleanObject(body)) as IDataObject;
      break;
    }

    case 'voidLabel': {
      const shipmentId = this.getNodeParameter('shipmentId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/voidlabel', { shipmentId }) as IDataObject;
      break;
    }

    case 'getShipmentRates': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const packageCode = this.getNodeParameter('packageCode', i) as string;
      const shipFrom = this.getNodeParameter('shipFrom', i) as IDataObject;
      const shipTo = this.getNodeParameter('shipTo', i) as IDataObject;
      const weight = this.getNodeParameter('weight', i) as IDataObject;
      const dimensions = this.getNodeParameter('dimensions', i) as IDataObject;

      const body: IDataObject = {
        carrierCode,
        packageCode,
        fromPostalCode: shipFrom.postalCode,
        toCountry: shipTo.country,
        toPostalCode: shipTo.postalCode,
        toState: shipTo.state,
        toCity: shipTo.city,
        weight: buildWeightObject(weight),
      };

      if (dimensions && Object.keys(dimensions).length > 0) {
        body.dimensions = buildDimensionsObject(dimensions);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/getrates', cleanObject(body)) as IDataObject;
      break;
    }

    case 'createLabelFromShipment': {
      const shipmentId = this.getNodeParameter('shipmentId', i) as number;
      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/createlabel', { shipmentId }) as IDataObject;
      break;
    }

    case 'createReturnLabel': {
      const carrierCode = this.getNodeParameter('carrierCode', i) as string;
      const serviceCode = this.getNodeParameter('serviceCode', i) as string;
      const packageCode = this.getNodeParameter('packageCode', i) as string;
      const shipFrom = this.getNodeParameter('shipFrom', i) as IDataObject;
      const shipTo = this.getNodeParameter('shipTo', i) as IDataObject;
      const weight = this.getNodeParameter('weight', i) as IDataObject;
      const dimensions = this.getNodeParameter('dimensions', i) as IDataObject;
      const labelOptions = this.getNodeParameter('labelOptions', i) as IDataObject;

      const body: IDataObject = {
        carrierCode,
        serviceCode,
        packageCode,
        shipFrom: buildAddressObject(shipTo), // Swap for return
        shipTo: buildAddressObject(shipFrom), // Swap for return
        weight: buildWeightObject(weight),
        ...labelOptions,
      };

      if (dimensions && Object.keys(dimensions).length > 0) {
        body.dimensions = buildDimensionsObject(dimensions);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/shipments/createlabel', cleanObject(body)) as IDataObject;
      break;
    }

    case 'createLabelFromOrder': {
      const orderId = this.getNodeParameter('orderId', i) as number;
      const labelOptions = this.getNodeParameter('orderLabelOptions', i) as IDataObject;

      const body: IDataObject = {
        orderId,
        ...labelOptions,
      };

      if (labelOptions.shipDate) {
        body.shipDate = formatDate(labelOptions.shipDate as string);
      }

      responseData = await shipStationApiRequest.call(this, 'POST', '/orders/createlabelfororder', cleanObject(body)) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return responseData;
}
