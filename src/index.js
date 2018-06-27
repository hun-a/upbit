import rq from 'request-promise';
import { sign } from 'jsonwebtoken';
import { encode as queryEncode } from 'querystring';
import fs from 'fs';
import path from 'path';

const getAllAssets = (access_key, secret_key) => {
  const payload = { access_key, nonce: (new Date).getTime() };
  const token = sign(payload, secret_key);
  const options = {
    method: "GET",
    url: "https://api.upbit.com/v1/accounts",
    headers: {Authorization: `Bearer ${token}`}
  };

  return rq(options);
};

const printAllAssets = input => {
  JSON.parse(input).forEach(v => console.log(v));
};

const getAvailableOrder = (access_key, secret_key) => {
  const market = 'KRW-EOS'
  const query = queryEncode({market});
  const payload = {
    access_key,
    nonce: (new Date).getTime(),
    query
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "GET",
    url: "https://api.upbit.com/v1/orders/chance?" + query,
    headers: {Authorization: `Bearer ${token}`}
  };

  return rq(options);
};

const getCurrentPrice = id => {
  return rq.get(`https://api.upbit.com/v1/ticker?markets=${id}`);
};

const howMuchEarnedAssets = async (access_key, secret_key, id) => {
  const currentPrice = JSON.parse(await getCurrentPrice(id))[0].trade_price;
  const myAssets = JSON.parse(await getAllAssets(access_key, secret_key))[1];

  console.log(`currency: ${myAssets.currency}\n balance: ${myAssets.balance}, buy: ${myAssets.avg_krw_buy_price}, current: ${currentPrice} => ${((currentPrice / myAssets.avg_krw_buy_price) * 100 - 100).toFixed(2)} %`);
  if (myAssets.avg_krw_buy_price < currentPrice) {
    console.log('Will be rich!');
  } else if (myAssets.avg_krw_buy_price === currentPrice) {
    console.log('Same same...');
  } else {
    console.log('Will be poor!');
  }
};

const keyFile = path.join(__dirname, '../key.json');
fs.readFile(keyFile, (err, data) => {
  if (err) throw new Error(err);

  const keys = JSON.parse(data);
  const access_key = keys.access_key,
        secret_key = keys.secret_key;

  howMuchEarnedAssets(access_key, secret_key, 'KRW-EOS');
});