
# Trading Engine

This is a high-performance trading engine built with Node.js, Express, and MongoDB. It features a robust order matching system, real-time data processing with Kafka, and a secure authentication system.

## Project Structure

The project is organized into the following main directories:

-   `src`: Contains the main source code.
    -   `config`: Configuration files for the database, Kafka, and Redis.
    -   `middleware`: Express middleware for authentication and error handling.
    -   `services`: Core application services, including authentication, orders, and wallet.
    -   `utils`: Utility functions and helper classes.
-   `test`: Test files.

## Core Logic

### Order Matching Engine

The order matching engine is the core of the trading platform. It uses a sophisticated algorithm to match buy and sell orders in real-time. The matching engine is implemented in `src/matching-engine-algorithm/orders-matching-engine.ts`. It uses Redis for fast in-memory order book management.

### Bulk Insertion

The bulk insertion mechanism is responsible for efficiently inserting large volumes of data into the database. It uses Kafka to queue and process data in batches, ensuring high throughput and minimizing database load. The bulk insertion logic is implemented in `src/services/kafka-services/bulk-insertion.ts`.

## API Endpoints

### Authentication

-   `POST /api/v1/auth/register`: Register a new user.
-   `POST /api/v1/auth/login`: Login an existing user.
-   `POST /api/v1/auth/logout`: Logout a user.
-   `POST /api/v1/auth/refresh`: Refresh an access token.

### Wallet

-   `POST /api/v1/wallet/create`: Create a new wallet for a user.
-   `GET /api/v1/wallet/balance/:userId`: Get the wallet balance for a user.
-   `PUT /api/v1/wallet/balance/:userId`: Update the wallet balance for a user.

### Orders

-   `POST /api/v1/orders/buy`: Place a new buy order.
-   `POST /api/v1/orders/sell`: Place a new sell order.
-   `POST /api/v1/orders/open`: Get all open orders for a user.
-   `POST /api/v1/orders/close`: Close an open order.
-   `GET /api/v1/orders/history/:userId`: Get the order history for a user.
-   `GET /api/v1/orders/orderbook`: Get the current order book.

## Getting Started

1.  Install dependencies: `npm install`
2.  Start the server: `npm start`
3.  Run the tests: `npm test`

