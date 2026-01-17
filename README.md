# n8n-nodes-shipstation

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for ShipStation providing 17 resources and 80+ operations for e-commerce shipping automation. Supports multi-carrier rate shopping, label creation, order management, inventory tracking, and real-time webhook events.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![ShipStation](https://img.shields.io/badge/ShipStation-API-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **17 Resources** covering the complete ShipStation API
- **80+ Operations** for comprehensive shipping automation
- **Dual API Support** for both V1 (Basic Auth) and V2 (API Key) authentication
- **Multi-Carrier Rate Shopping** across UPS, FedEx, USPS, DHL, and 50+ carriers
- **Label Generation** with customizable formats (PDF, PNG, ZPL)
- **Order Management** with full lifecycle support
- **Inventory Tracking** across multiple warehouses
- **Webhook Triggers** for real-time event notifications

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-shipstation`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-shipstation

# Restart n8n
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-shipstation.zip
cd n8n-nodes-shipstation

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-shipstation

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-shipstation %CD%

# 5. Restart n8n
# If running n8n locally:
n8n start

# If running n8n via Docker, restart the container:
# docker restart n8n
```

## Credentials Setup

### V1 API (Basic Auth)

| Field | Description |
|-------|-------------|
| API Version | Select "V1" |
| API Key | Your ShipStation API Key |
| API Secret | Your ShipStation API Secret |

### V2 API (API Key Header)

| Field | Description |
|-------|-------------|
| API Version | Select "V2" |
| API Key | Your ShipStation V2 API Key |

### Getting API Credentials

1. Log in to ShipStation at https://ship.shipstation.com
2. Go to **Settings** → **Account** → **API Settings**
3. Generate or copy your API keys

## Resources & Operations

| Resource | Operations | API Version |
|----------|------------|-------------|
| **Orders** | List, Get, Create, Update, Delete, Create/Update, Add Tag, Remove Tag, List by Tag, Assign User, Unassign User, Hold, Release, Restore, Mark Shipped | V1 |
| **Shipments** | List, Get, Create Label, Create Label from Order, Create Label from Shipment, Void Label, Get Rates, Create Return Label | V1 |
| **Carriers** | List, Get, List Services, List Packages, Add Funds | V1 |
| **Rates** | Get Rates, Get Bulk Rates, Estimate Rates | V1 |
| **Customers** | List, Get | V1 |
| **Stores** | List, Get, Update, Get Refresh Status, Refresh Store, Deactivate | V1 |
| **Warehouses** | List, Get, Create, Update, Delete, List Inventory Warehouses | V1/V2 |
| **Products** | List, Get, Update, List by Tag, Add Tag, Remove Tag | V1 |
| **Fulfillments** | List, Get | V1 |
| **Inventory** | List, Get, Update, Adjust, Set Quantity, List by Warehouse | V2 |
| **Addresses** | Validate, Parse | V1 |
| **Tags** | List | V1 |
| **Users** | List | V1 |
| **Webhooks** | List, Create, Delete | V1 |
| **Manifests** | Create, List, Get | V2 |
| **Pickups** | Schedule, List, Get, Cancel | V2 |
| **Batches** | Create, List, Get, Delete, Add Shipments, Remove Shipments, Process | V2 |

## Trigger Node

The **ShipStation Trigger** node receives real-time webhook events:

| Event | Description |
|-------|-------------|
| ORDER_NOTIFY | Order created or updated |
| SHIP_NOTIFY | Shipment created |
| ITEM_ORDER_NOTIFY | Item-level order events |
| ITEM_SHIP_NOTIFY | Item-level shipment events |
| FULFILLMENT_SHIPPED | Fulfillment completed |
| FULFILLMENT_REJECTED | Fulfillment rejected |

## Usage Examples

### Create an Order

```json
{
  "resource": "orders",
  "operation": "createOrder",
  "orderNumber": "TEST-001",
  "orderDate": "2024-01-15",
  "orderStatus": "awaiting_shipment",
  "shipTo": {
    "name": "John Doe",
    "street1": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701",
    "country": "US"
  }
}
```

### Get Shipping Rates

```json
{
  "resource": "rates",
  "operation": "getRates",
  "carrierCode": "ups",
  "shipFrom": { "postalCode": "78701", "country": "US" },
  "shipTo": { "postalCode": "90210", "country": "US" },
  "weight": { "value": 16, "units": "ounces" }
}
```

### Create a Shipping Label

```json
{
  "resource": "shipments",
  "operation": "createLabel",
  "carrierCode": "usps",
  "serviceCode": "usps_priority_mail",
  "shipFrom": {
    "name": "My Store",
    "street1": "100 Commerce Way",
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701",
    "country": "US"
  },
  "shipTo": {
    "name": "Customer Name",
    "street1": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90001",
    "country": "US"
  },
  "weight": { "value": 1, "units": "pounds" }
}
```

## ShipStation Concepts

### Order Statuses

- **awaiting_payment** - Order received, payment pending
- **awaiting_shipment** - Payment complete, ready to ship
- **on_hold** - Order temporarily held
- **shipped** - Order has been shipped
- **cancelled** - Order cancelled

### Rate Shopping

ShipStation supports rate shopping across multiple carriers. Use the Rates resource to compare prices and delivery times before creating labels.

### Label Formats

- **PDF** - Standard printable format
- **PNG** - Image format for thermal printers
- **ZPL** - Zebra Programming Language for Zebra printers

## Error Handling

The node includes comprehensive error handling:

- **Rate Limiting**: Automatically handles 429 errors (40 requests/minute limit)
- **Authentication**: Clear error messages for invalid credentials
- **Validation**: Input validation before API calls
- **Continue on Fail**: Option to continue workflow on errors

## Security Best Practices

1. Store API credentials securely using n8n's credential system
2. Use V2 API when possible for enhanced security
3. Limit API key permissions to required operations
4. Rotate API keys periodically
5. Monitor API usage in ShipStation dashboard

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure all contributions comply with the BSL 1.1 license terms.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- **Issues**: https://github.com/Velocity-BPA/n8n-nodes-shipstation/issues
- **Commercial Licensing**: licensing@velobpa.com
- **Website**: https://velobpa.com

## Acknowledgments

- [ShipStation](https://www.shipstation.com/) for their comprehensive shipping API
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for inspiration and best practices
