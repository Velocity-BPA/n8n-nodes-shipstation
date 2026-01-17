/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Log the licensing notice once per node load
 */
let licenseNoticeLogged = false;

export function logLicensingNotice(): void {
  if (!licenseNoticeLogged) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licenseNoticeLogged = true;
  }
}

/**
 * Convert execution data to return format
 */
export function prepareOutput(
  items: IDataObject[],
  pairedItem: { item: number },
): INodeExecutionData[] {
  return items.map((item) => ({
    json: item,
    pairedItem,
  }));
}

/**
 * Build address object from parameters
 */
export function buildAddressObject(params: IDataObject): IDataObject {
  const address: IDataObject = {};
  
  if (params.name) address.name = params.name;
  if (params.company) address.company = params.company;
  if (params.street1) address.street1 = params.street1;
  if (params.street2) address.street2 = params.street2;
  if (params.street3) address.street3 = params.street3;
  if (params.city) address.city = params.city;
  if (params.state) address.state = params.state;
  if (params.postalCode) address.postalCode = params.postalCode;
  if (params.country) address.country = params.country;
  if (params.phone) address.phone = params.phone;
  if (params.residential !== undefined) address.residential = params.residential;
  
  return address;
}

/**
 * Build weight object from parameters
 */
export function buildWeightObject(params: IDataObject): IDataObject {
  const weight: IDataObject = {};
  
  if (params.value !== undefined) weight.value = params.value;
  if (params.units) weight.units = params.units;
  
  return weight;
}

/**
 * Build dimensions object from parameters
 */
export function buildDimensionsObject(params: IDataObject): IDataObject {
  const dimensions: IDataObject = {};
  
  if (params.length !== undefined) dimensions.length = params.length;
  if (params.width !== undefined) dimensions.width = params.width;
  if (params.height !== undefined) dimensions.height = params.height;
  if (params.units) dimensions.units = params.units;
  
  return dimensions;
}

/**
 * Build order item object from parameters
 */
export function buildOrderItemObject(item: IDataObject): IDataObject {
  const orderItem: IDataObject = {
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  };
  
  if (item.imageUrl) orderItem.imageUrl = item.imageUrl;
  if (item.weight) orderItem.weight = item.weight;
  if (item.productId) orderItem.productId = item.productId;
  if (item.fulfillmentSku) orderItem.fulfillmentSku = item.fulfillmentSku;
  if (item.adjustment !== undefined) orderItem.adjustment = item.adjustment;
  if (item.upc) orderItem.upc = item.upc;
  if (item.options) orderItem.options = item.options;
  
  return orderItem;
}

/**
 * Parse items JSON string safely
 */
export function parseItemsJson(itemsJson: string): IDataObject[] {
  try {
    const parsed = JSON.parse(itemsJson);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [parsed];
  } catch {
    throw new Error('Invalid JSON format for items. Expected an array of item objects.');
  }
}

/**
 * Format shipping rate for response
 */
export function formatShippingRate(rate: IDataObject): IDataObject {
  return {
    serviceName: rate.serviceName,
    serviceCode: rate.serviceCode,
    shipmentCost: rate.shipmentCost,
    otherCost: rate.otherCost,
    totalCost: (rate.shipmentCost as number) + (rate.otherCost as number || 0),
    carrier: rate.carrier,
  };
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: IDataObject,
  requiredFields: string[],
  context: string,
): void {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields for ${context}: ${missingFields.join(', ')}`,
    );
  }
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Deep clean object by removing undefined/null values
 */
export function cleanObject(obj: IDataObject): IDataObject {
  const cleaned: IDataObject = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value as IDataObject);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
}

/**
 * Generate a unique order number if not provided
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format date to ShipStation format
 */
export function formatDate(date: string | Date | undefined): string | undefined {
  if (!date) return undefined;
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('.')[0] + 'Z';
}
