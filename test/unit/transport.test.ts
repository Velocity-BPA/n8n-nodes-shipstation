/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { buildQueryString, formatDateForApi } from '../../nodes/ShipStation/transport';
import {
  cleanObject,
  formatDate,
  parseItemsJson,
  buildAddressObject,
  buildWeightObject,
  buildDimensionsObject,
} from '../../nodes/ShipStation/utils';

describe('Transport Layer', () => {
  describe('buildQueryString', () => {
    it('should filter out empty values', () => {
      const params = {
        name: 'test',
        empty: '',
        nullValue: null,
        undefinedValue: undefined,
        zero: 0,
      };
      const result = buildQueryString(params);
      expect(result).toHaveProperty('name', 'test');
      expect(result).toHaveProperty('zero', 0);
      expect(result).not.toHaveProperty('empty');
      expect(result).not.toHaveProperty('nullValue');
      expect(result).not.toHaveProperty('undefinedValue');
    });

    it('should handle nested objects', () => {
      const params = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31',
        },
      };
      const result = buildQueryString(params);
      expect(result).toHaveProperty('dateRangeStart', '2024-01-01');
      expect(result).toHaveProperty('dateRangeEnd', '2024-01-31');
    });
  });

  describe('formatDateForApi', () => {
    it('should convert string date to ISO format', () => {
      const result = formatDateForApi('2024-01-15');
      expect(result).toContain('2024-01-15');
    });

    it('should convert Date object to ISO format', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDateForApi(date);
      expect(result).toBe('2024-01-15T12:00:00.000Z');
    });
  });
});

describe('Utilities', () => {
  describe('cleanObject', () => {
    it('should remove empty strings and nulls', () => {
      const obj = {
        name: 'test',
        empty: '',
        nullValue: null,
        zero: 0,
        falseValue: false,
      };
      const result = cleanObject(obj);
      expect(result).toHaveProperty('name', 'test');
      expect(result).toHaveProperty('zero', 0);
      expect(result).toHaveProperty('falseValue', false);
      expect(result).not.toHaveProperty('empty');
      expect(result).not.toHaveProperty('nullValue');
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toBe('2024-01-15T12:00:00Z');
    });

    it('should return undefined for undefined input', () => {
      const result = formatDate(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('parseItemsJson', () => {
    it('should parse valid JSON array', () => {
      const json = '[{"sku": "ABC123", "quantity": 2}]';
      const result = parseItemsJson(json);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('sku', 'ABC123');
    });

    it('should throw on empty input', () => {
      expect(() => parseItemsJson('')).toThrow();
    });

    it('should throw on invalid JSON', () => {
      expect(() => parseItemsJson('not json')).toThrow();
    });
  });

  describe('buildAddressObject', () => {
    it('should build address object from flat params', () => {
      const params = {
        name: 'John Doe',
        street1: '123 Main St',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'US',
      };
      const result = buildAddressObject(params);
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('street1', '123 Main St');
      expect(result).toHaveProperty('city', 'Austin');
      expect(result).toHaveProperty('state', 'TX');
      expect(result).toHaveProperty('postalCode', '78701');
      expect(result).toHaveProperty('country', 'US');
    });

    it('should filter out empty values', () => {
      const params = {
        name: 'John Doe',
        street1: '123 Main St',
        street2: '',
        city: 'Austin',
      };
      const result = buildAddressObject(params);
      expect(result).not.toHaveProperty('street2');
    });
  });

  describe('buildWeightObject', () => {
    it('should build weight object', () => {
      const result = buildWeightObject({ value: 16, units: 'ounces' });
      expect(result).toEqual({ value: 16, units: 'ounces' });
    });

    it('should handle partial data', () => {
      const result = buildWeightObject({ value: 1 });
      expect(result).toEqual({ value: 1 });
    });
  });

  describe('buildDimensionsObject', () => {
    it('should build dimensions object', () => {
      const result = buildDimensionsObject({ length: 10, width: 8, height: 6, units: 'inches' });
      expect(result).toEqual({
        length: 10,
        width: 8,
        height: 6,
        units: 'inches',
      });
    });

    it('should handle partial data', () => {
      const result = buildDimensionsObject({ length: 10, width: 8, height: 6 });
      expect(result).toEqual({
        length: 10,
        width: 8,
        height: 6,
      });
    });
  });
});
