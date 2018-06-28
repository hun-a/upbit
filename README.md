# Open API for Upbit

😎😆😈🤓😸

# How to use

- Clone this repo

```
$ git clone https://github.com/hun-a/upbit.git
```

- You must create the `key.json` file into the root directory.
  
  - You can generate these keys at the Upbit

```
$ cd upbit && touch key.json

// key.json
{
  "access_key": "your access key",
  "secret_key": "your secret key"
}
```

- You must specify the MARKET environment variable for the asset you want to check.
  
  - If you don't know market name, please refer to [here](https://api.upbit.com/v1/market/all).
  
  - Below command assigned EOS as korean price to the `MARKET` environment variable.

```
$ yarn build && MARKET=KRW-EOS yarn start
```


