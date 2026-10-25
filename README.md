# IoT Device Management Backend

A RESTful backend API for managing IoT devices, monitoring device status, and collecting sensor telemetry using **Node.js, Express.js, and MongoDB**. Includes JWT-based authentication, device-specific API keys, and secure, user-scoped device management.

<!-- Technology Badges -->
<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="npm" />
</p>

## Features

- **Authentication and Authorization**
  - User registration and login
  - Password hashing with bcrypt
  - JWT-based authentication
  - Protected API endpoints

- **IoT Device Management**
  - Register and manage IoT devices
  - Retrieve device details
  - Update device information and status
  - Delete registered devices
  - Store device type, location, and metadata

- **Device Status Monitoring**
  - Online, offline, and maintenance statuses
  - Track the last-seen timestamp
  - Automatically update status when telemetry is received

- **Telemetry Management**
  - Ingest sensor readings using device-specific API keys
  - Store telemetry records in MongoDB
  - Retrieve historical sensor data
  - Filter telemetry by date range
  - Limit the number of returned records

- **API and Security**
  - RESTful API architecture
  - Pagination and device search
  - Request validation and centralized error handling
  - Security headers using Helmet
  - Configurable CORS
  - API rate limiting

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | NoSQL database |
| Mongoose | MongoDB object modeling |
| JavaScript | Backend programming language |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin request configuration |
| Morgan | HTTP request logging |
| express-rate-limit | API rate limiting |
| dotenv | Environment variable management |

## Project Structure

```text
iot-device-management/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Device.js
│   │   └── Telemetry.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── device.routes.js
│   │   └── telemetry.routes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   └── crypto.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) version 20 or later
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or a [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [Git](https://git-scm.com/)
- [Postman](https://www.postman.com/) or another API testing tool

### 1. Clone the Repository

```bash
git clone https://github.com/ajinkya029/iot-device-management.git
cd iot-device-management
```

Replace `YOUR_USERNAME` with your GitHub username and update the repository name if needed.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying `.env.example`.

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/iot_device_management
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

**Important:** Never commit your `.env` file or expose your JWT secret or device keys in a public repository.

### 4. Start the Server

Development mode with automatic restarts:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API runs at:

```text
http://localhost:5000
```

### 5. Verify the API

Send a `GET` request to:

```http
http://localhost:5000/api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "iot-device-management-api",
  "timestamp": "2026-10-25T00:00:00.000Z"
}
```

The timestamp will reflect the actual server time.

## API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Not required |
| POST | `/auth/login` | Log in and receive a JWT | Not required |

#### Register a User

`POST /api/auth/register`

Request body:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "StrongPass123"
}
```

#### Login

`POST /api/auth/login`

Request body:

```json
{
  "email": "demo@example.com",
  "password": "StrongPass123"
}
```

Both endpoints return a JWT on success. Use the token for protected endpoints.

### Device Management Endpoints

Include this header for protected requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/devices` | Register a device |
| GET | `/devices` | List your devices |
| GET | `/devices/:deviceId` | Retrieve device details |
| PATCH | `/devices/:deviceId` | Update a device |
| DELETE | `/devices/:deviceId` | Delete a device |

#### Register a Device

`POST /api/devices`

Example request body:

```json
{
  "name": "Greenhouse Sensor",
  "type": "temperature-humidity",
  "location": {
    "label": "Greenhouse",
    "latitude": 19.9975,
    "longitude": 73.7898
  },
  "metadata": {
    "firmware": "1.0.0"
  }
}
```

#### List Devices

`GET /api/devices?page=1&limit=20`

Optional query parameters:

- `page` — page number
- `limit` — number of records per page, up to 100
- `search` — search devices by name
- `status` — filter by `online`, `offline`, or `maintenance`

### Telemetry Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/devices/:deviceId/telemetry` | Submit sensor readings | Device API key |
| GET | `/devices/:deviceId/telemetry` | Retrieve telemetry history | User JWT |

#### Submit Sensor Readings

`POST /api/devices/:deviceId/telemetry`

Headers:

```http
Content-Type: application/json
x-device-key: YOUR_DEVICE_KEY
```

Request body:

```json
{
  "values": {
    "temperatureC": 24.6,
    "humidity": 48.2,
    "batteryPercent": 92
  }
}
```

The API stores the telemetry record and updates the device's last-seen timestamp. Devices not in maintenance status are marked online when telemetry is received.

#### Retrieve Telemetry History

`GET /api/devices/:deviceId/telemetry?limit=50`

Optional query parameters:

- `limit` — number of records to return, up to 500
- `from` — start of the date range
- `to` — end of the date range

Example:

```http
GET /api/devices/DEVICE_ID/telemetry?limit=50&from=2026-10-01&to=2026-10-31
```

Use your JWT in the `Authorization` header.

## Authentication Flow

1. A user registers or logs in.
2. The server verifies credentials and issues a JWT.
3. The client sends the JWT with protected device-management requests.
4. Each device is associated with its owner.
5. A device submits telemetry using its device-specific API key.
6. The server validates the key and stores the incoming readings.

## Error Handling

The API returns appropriate HTTP status codes, including:

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Invalid request or validation error |
| `401` | Authentication failed or credentials missing |
| `404` | Resource or route not found |
| `409` | Duplicate unique value |
| `500` | Internal server error |

## Security Considerations

- Passwords are hashed using bcrypt.
- Protected endpoints require JWT authentication.
- Device access is scoped to the authenticated owner.
- Device telemetry ingestion requires a device-specific key.
- Helmet and rate limiting provide baseline API protections.
- Use HTTPS/TLS in production.
- Keep secrets in environment variables.
- For production deployment, consider hashing device keys at rest, key rotation, monitoring, and stricter CORS policies.

**Implementation note:** Before using this project in production, review the device-key provisioning flow. The current Mongoose schema excludes device keys from ordinary queries, so the creation endpoint should be updated to explicitly return the plaintext key once at provisioning, while keeping it hidden in subsequent responses. Device-key authentication should also use secure hash verification if keys are stored hashed.

## Future Improvements

- React-based device management dashboard
- MQTT broker integration for device messaging
- Real-time telemetry updates with WebSockets
- Device alerts and threshold-based notifications
- Device firmware management
- Device-key rotation and revocation
- Automated API and integration tests
- Docker support and CI/CD deployment

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request describing your improvements.

## License

This project is available under the MIT License. Add a `LICENSE` file to the repository if you intend to distribute it under that license.

## 👨‍💻 Author

**Ajinkya Dhatrak**

GitHub: [ajinkya029](https://github.com/ajinkya029)

---

**Built with Node.js, Express.js, and MongoDB.**
