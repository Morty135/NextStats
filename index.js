const express = require('express');
const axios = require('axios');
require('dotenv').config();

async function fetchPools() {
    try {
        const response = await axios.get(`${process.env.MININGCORE_BASE}/api/pools`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pool stats:', error);
        return null;
    }
}

async function print(){
    console.log(await fetchPools());
}
print();