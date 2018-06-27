import rq from 'request-promise';
import { sign } from 'jsonwebtoken';
import { encode as queryEncode } from 'querystring';

const getAllAssets = (access_key, secret_key) => {
  const payload = {
    access_key,
    nonce: (new Date).getTime()
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "GET",
    url: "https://api.upbit.com/v1/accounts",
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  return rq(options);
};

const printAllAssets = input => {
  JSON.parse(input).forEach(v => console.log(v));
};

const getAvailableOrder = (access_key, secret_key) => {
  const market = 'KRW-EOS'
  const query = queryEncode({
    market
  });
  const payload = {
    access_key,
    nonce: (new Date).getTime(),
    query
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "GET",
    url: "https://api.upbit.com/v1/orders/chance?" + query,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  return rq(options);
};

const getCurrentPrice = id => {
  return rq.get(`https://api.upbit.com/v1/ticker?markets=${id}`);
};

const howMuchEarnedAssets = async (access_key, secret_key, id) => {
  const currency = id.split('-')[1] || '';
  const currentPrice = JSON.parse(await getCurrentPrice(id))[0].trade_price;
  const myAssets = JSON.parse(
    await getAllAssets(access_key, secret_key)
  ).filter(v => v.currency === currency)[0] || {};
  const balance = myAssets.balance;
  const avgPrice = myAssets.avg_krw_buy_price;
  const rate = ((currentPrice / avgPrice) * 100 - 100).toFixed(2);
  const principal = (balance * avgPrice).toFixed(0);
  const totalKrw = (balance * currentPrice).toFixed(0);

  console.log(`currency: ${currency}\n balance: ${balance}, buy: ${avgPrice}, current: ${currentPrice} => ${rate} %\n KRW: ${principal} => ${totalKrw} WON`);
  if (myAssets.avg_krw_buy_price < currentPrice) {
    console.log('Will be rich!');
  } else if (myAssets.avg_krw_buy_price === currentPrice) {
    console.log('Same same...');
  } else {
    console.log('Will be poor!');
  }
};

export {
  howMuchEarnedAssets
};