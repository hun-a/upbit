import fs from 'fs';
import path from 'path';
import { howMuchEarnedAssets } from './api';

const market = process.env.MARKET || 'KRW-BTC';
const keyFile = path.join(__dirname, '../key.json');
fs.readFile(keyFile, (err, data) => {
  if (err) throw new Error(err);

  const keys = JSON.parse(data);
  const access_key = keys.access_key,
        secret_key = keys.secret_key;

  howMuchEarnedAssets(access_key, secret_key, market);
});