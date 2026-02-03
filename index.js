const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

const poolsData = {};
let lastUpdate = 0;

app.use(helmet());

// rate limit
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);



async function fetchPools() {
    try {
        const response = await axios.get(
            `${process.env.MININGCORE_BASE}/api/pools`,
            { timeout: 5000 }
        );
        return response.data.pools;
    } catch (err) {
        console.error('Miningcore fetch failed');
        return null;
    }
}



function formatBlockTime(ts) {
    if (!ts) return 'no block found';

    if (typeof ts === 'string') {
        const d = new Date(ts);
        return isNaN(d.getTime()) ? 'no block found' : d.toISOString();
    }

    if (typeof ts === 'number' && ts > 0) {
        const d = new Date(ts * 1000);
        return isNaN(d.getTime()) ? 'no block found' : d.toISOString();
    }

    return 'no block found';
}



async function formatData() {
    const now = Date.now();
    if (now - lastUpdate < process.env.CACHE_TTL) return;

    const pools = await fetchPools();
    if (!pools) return;

    for (const pool of pools) {
        poolsData[pool.id] = {
            feePercent: pool.poolFeePercent,
            paymentScheme: pool.paymentProcessing.payoutScheme,
            minPayout: pool.paymentProcessing.minimumPayment,
            miners: pool.poolStats.connectedMiners,
            hashrate: pool.poolStats.poolHashrate,
            blocks: pool.totalBlocks,
            height: pool.networkStats.blockHeight,
            lastBlockTime: formatBlockTime(pool.lastPoolBlockTime)
        };
    }

    lastUpdate = now;
}



app.get('/api/pools/:poolId', async (req, res) => {
    await formatData();

    const pool = poolsData[req.params.poolId];
    if (!pool) {
        return res.status(404).json({ error: 'unknown_pool' });
    }

    res.set('Cache-Control', 'public, max-age=30');
    res.json(pool);
});



app.get('/api/pools', async (req, res) => {
    await formatData();

    const pools = Object.keys(poolsData);

    res.json(pools);
});



app.get('/api/help', async (req, res) => {
    const help = {
        "endpoints": [
            {
                "method": "GET",
                "path": "/api/help",
                "description": "List available API endpoints"
            },
            {
                "method": "GET",
                "path": "/api/pools",
                "description": "List available pool IDs"
            },
            {
                "method": "GET",
                "path": "/api/stats/:poolId",
                "description": "Public stats for a specific pool"
            }
        ]
    };
    res.json(help);
});



app.listen(process.env.PORT, () => {
    console.log(`Stats API running on port: ${process.env.PORT}`);
});