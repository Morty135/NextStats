# Mining Pool Stats API

This is a simple Node.js API for fetching and serving statistics from a Miningcore backend.  
It is intended to expose the API in a tamper safe way. (Read only)

## Features

- Fetch pool info: fees, payment scheme, connected miners, hashrate, blocks, and last block time.  
- Basic caching to reduce requests to the Miningcore server.  
- Rate-limited API with security headers (Helmet).
- Formated for sites like miningpoolstats.stream.

## Requirements

- Node.js 22+  
- Access to a Miningcore server
