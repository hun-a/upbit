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

const getEosCurrentPrice = id => {
  return rq.get(`https://api.upbit.com/v1/ticker?markets=${id}`);
}

const keyFile = path.join(__dirname, '../key.json');
fs.readFile(keyFile, (err, data) => {
  if (err) throw new Error(err);

  const keys = JSON.parse(data);
  const access_key = keys.access_key,
        secret_key = keys.secret_key;

  getEosCurrentPrice('KRW-EOS')
    .then(data => {
      const currentPrice = JSON.parse(data)[0].trade_price;
      getAllAssets(access_key, secret_key)
        .then(data => {
          const myEos = JSON.parse(data)[1] || {};
          console.log(`buy: ${myEos.avg_krw_buy_price}, current: ${currentPrice} => ${((currentPrice / myEos.avg_krw_buy_price) * 100 - 100).toFixed(2)} %`);
          if (myEos.avg_krw_buy_price < currentPrice) {
            console.log('Will be rich!');
          } else if (myEos.avg_krw_buy_price === currentPrice) {
            console.log('Same same...');
          } else {
            console.log('Will be poor!');
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});