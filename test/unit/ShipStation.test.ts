/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ShipStation } from '../../nodes/ShipStation/ShipStation.node';
import { ShipStationTrigger } from '../../nodes/ShipStation/ShipStationTrigger.node';

describe('ShipStation Node', () => {
  let shipStation: ShipStation;

  beforeEach(() => {
    shipStation = new ShipStation();
  });

  describe('Node Description', () => {
    it('should have correct displayName', () => {
      expect(shipStation.description.displayName).toBe('ShipStation');
    });

    it('should have correct name', () => {
      expect(shipStation.description.name).toBe('shipStation');
    });

    it('should have correct version', () => {
      expect(shipStation.description.version).toBe(1);
    });

    it('should require shipStationApi credentials', () => {
      const credentials = shipStation.description.credentials;
      expect(credentials).toBeDefined();
      expect(credentials?.length).toBe(1);
      expect(credentials?.[0].name).toBe('shipStationApi');
      expect(credentials?.[0].required).toBe(true);
    });

    it('should have resource property', () => {
      const resourceProperty = shipStation.description.properties.find(
        (p) => p.name === 'resource'
      );
      expect(resourceProperty).toBeDefined();
      expect(resourceProperty?.type).toBe('options');
    });

    it('should have all 17 resources', () => {
      const resourceProperty = shipStation.description.properties.find(
        (p) => p.name === 'resource'
      );
      const options = resourceProperty?.options as Array<{ value: string }>;
      expect(options?.length).toBe(17);

      const resourceValues = options?.map((o) => o.value);
      expect(resourceValues).toContain('orders');
      expect(resourceValues).toContain('shipments');
      expect(resourceValues).toContain('carriers');
      expect(resourceValues).toContain('rates');
      expect(resourceValues).toContain('customers');
      expect(resourceValues).toContain('stores');
      expect(resourceValues).toContain('warehouses');
      expect(resourceValues).toContain('products');
      expect(resourceValues).toContain('fulfillments');
      expect(resourceValues).toContain('inventory');
      expect(resourceValues).toContain('addresses');
      expect(resourceValues).toContain('tags');
      expect(resourceValues).toContain('users');
      expect(resourceValues).toContain('webhooks');
      expect(resourceValues).toContain('manifests');
      expect(resourceValues).toContain('pickups');
      expect(resourceValues).toContain('batches');
    });
  });
});

describe('ShipStation Trigger Node', () => {
  let trigger: ShipStationTrigger;

  beforeEach(() => {
    trigger = new ShipStationTrigger();
  });

  describe('Node Description', () => {
    it('should have correct displayName', () => {
      expect(trigger.description.displayName).toBe('ShipStation Trigger');
    });

    it('should have correct name', () => {
      expect(trigger.description.name).toBe('shipStationTrigger');
    });

    it('should be in trigger group', () => {
      expect(trigger.description.group).toContain('trigger');
    });

    it('should have no inputs', () => {
      expect(trigger.description.inputs).toEqual([]);
    });

    it('should have one output', () => {
      expect(trigger.description.outputs).toEqual(['main']);
    });

    it('should have webhook configuration', () => {
      expect(trigger.description.webhooks).toBeDefined();
      expect(trigger.description.webhooks?.length).toBe(1);
      expect(trigger.description.webhooks?.[0].httpMethod).toBe('POST');
    });

    it('should have event options', () => {
      const eventProperty = trigger.description.properties.find(
        (p) => p.name === 'event'
      );
      expect(eventProperty).toBeDefined();
      expect(eventProperty?.type).toBe('options');
      
      const options = eventProperty?.options as Array<{ value: string }>;
      expect(options?.length).toBe(6);
      expect(options?.map((o) => o.value)).toContain('ORDER_NOTIFY');
      expect(options?.map((o) => o.value)).toContain('SHIP_NOTIFY');
    });
  });

  describe('Webhook Methods', () => {
    it('should have default webhook methods', () => {
      expect(trigger.webhookMethods).toBeDefined();
      expect(trigger.webhookMethods.default).toBeDefined();
      expect(trigger.webhookMethods.default.checkExists).toBeDefined();
      expect(trigger.webhookMethods.default.create).toBeDefined();
      expect(trigger.webhookMethods.default.delete).toBeDefined();
    });
  });
});
