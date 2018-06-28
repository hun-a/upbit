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
  const currentPrice = JSON.parse(await getCurrentPrice(id))[0].trade_price || 0;
  const myAssets = JSON.parse(
    await getAllAssets(access_key, secret_key)
  ).filter(v => v.currency === currency)[0] || {};
  const balance = myAssets.balance || 0;
  const avgPrice = myAssets.avg_krw_buy_price || 0;
  const rate = ((currentPrice / avgPrice) * 100 - 100).toFixed(2) || 0;
  const principal = (balance * avgPrice).toFixed(0) || 0;
  const totalKrw = (balance * currentPrice).toFixed(0) || 0;

  console.log(`currency: ${currency}\n balance: ${balance}, buy: ${avgPrice}, current: ${currentPrice} => ${rate} %\n KRW: ${principal} => ${totalKrw} WON`);
  if (avgPrice === 0) {
    console.log('No assets...');
  } else if (avgPrice < currentPrice) {
    console.log('Will be rich!');
  } else if (avgPrice === currentPrice) {
    console.log('Same same...');
  } else {
    console.log('Will be poor!');
  }
};

const order = async params => {
  const { access_key, secret_key, market, side } = params;
  const currency = market.split('-')[1] || '';
  const price = JSON.parse(await getCurrentPrice(market))[0].trade_price;
  const assets = JSON.parse(await getAllAssets(access_key, secret_key));
  const krwAssets = assets.filter(v => v.currency === 'KRW').pop();
  const coinAssets = assets.filter(v => v.currency === currency).pop();
  const volume = side === 'bid' ? Math.floor(krwAssets.balance / price) : coinAssets.balance;
  const ord_type = 'limit';

  const body = {
    market, side, volume, price, ord_type
  };
  const payload = {
    access_key,
    nonce: (new Date).getTime(),
    query: queryEncode(body)
  };
  const token = sign(payload, secret_key);
  const options = {
    method: "POST",
    url: "https://api.upbit.com/v1/orders",
    headers: {Authorization: `Bearer ${token}`},
    json: body
  };

  return rq(options);
};

export {
  howMuchEarnedAssets
};