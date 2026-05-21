#!/usr/bin/env node

const TRIPO_API_KEY = 'tsk_FPGjHFJGWdhm2MqHeKoa3dI1CKNyqpIDrvOYW43rOdM';
const TRIPO_BASE_URL = 'https://api.tripo3d.ai/v2/openapi';

async function checkBalance() {
  const response = await fetch(`${TRIPO_BASE_URL}/user/balance`, {
    headers: {
      'Authorization': `Bearer ${TRIPO_API_KEY}`
    }
  });
  const result = await response.json();
  console.log('当前账户余额:', JSON.stringify(result, null, 2));
}

checkBalance().catch(console.error);
