---
title: Real Time
sidebar_position: 4 
---

## Long Polling

Long Polling 由 client 端不停地像 server 端詢問目前 state 的狀態，server 端提供 endpoint 給 client 詢問。

若有 10,000 個 user，設定每 2 秒就會發出新的 request 至 endpoint 詢問 state 的狀態，server 將會有大量的請求一次進來。

通常在前端直覺地使用 Long Polling 是使用 `setInterval` 每 x 秒進行一次 request，不過這難以確保上一個 request 已經結束了，而不停地進行新的 request。

在後端，就像一般的 API 一樣，只需要返回 state 的資訊。

```javascript
// get messages
app.get('/poll', function (req, res) {
  res.json({
    msg: getMsgs(),
  });
});

// create messages
app.post('/poll', function (req, res) {
  const { user, text } = req.body;
  const message = { user, text, time: Date.now() };
  msg.push(message);

  res.json({
    ...message,
    status: 'ok',
  });
});
```

在前端的部分使用 `setTimeout` 進行重覆的 request。

```javascript
const INTERVAL = 3000;
async function getNewMsgs() {
  let json;
  try {
    const res = await fetch('/poll');
    json = res.json();
  } catch (e) {
    console.error('polling error', e);
  }

  allChat = json.msg;
  // render page
  render();
  setTimeout(getNewMsgs, INTERVAL);
}
```

前端 `POST` 新的 message

```javascript
async function postNewMsg(user, text) {
  await fetch('/poll', {
    method: 'POST',
    body: JSON.stringify({ user, text }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
}
```

當建立新的 message 後，過一段時間就會獲取到最新的資料。
![](../static/long-polling.gif)

這是最簡單的一種 real time 的方式，單純的由前端發送 request 詢問 server 目前的資料。

遇到的問題是可能當 user 送出訊息後，可能因爲網路的關係導致很久後才獲取已經發送的資料，可以在發送後直接寫到前端的 state 中，當後端獲取資料時，移除重覆相同 id 的 message (或是其它能當成 uniq key 的)，這樣會有較好的使用者體驗。

另外一種方式是不拿取重覆的資料以降低回傳的大小，也是可以改善的地方。

使用 `setTimeout` 去 delay 獲取 server 上的資料會有個另外的問題，當使用者切換到別的分頁時，前端仍然不停的發送 request 詢問 server 目前的資料，造成了 CPU、memory 等的資源浪費 (若需求是就算切換分頁也要不停 request 就另外)。

使用 `requestAnimationFrame` 可以解決這種問題，當 user unfocus 在 window 上時，該 function 會自動的暫停。

```javascript
async function rafGetMsgs() {
  await getNewMsgs();
  await new Promise((resolve) => setTimeout(resolve, INTERVAL));
  window.requestAnimationFrame(rafGetMsgs);
}
rafGetMsgs();
```

以目前的程式架構會在其中一個 request 失敗(可能 user 更換網路、server 問題等)後整個程式將會中斷，並沒有任何其他的機制處理這問題。

可以嘗試使用 retry 當 request 失敗後進行，有個問題是在當 server 真的掛了之後，進行立即性的 retry 不停的 retry 可能導致一瞬間有上千 user 的 request 進行，就像是 DDOS 那樣。

另外一個策略稱爲 backoff 當進行 retry 時第一次可能是立即，之後以 3 秒、6 秒、9 秒...1 分鐘、1 分半持續的進行，有級數的 backoff 也有線性的 backoff。

實作 backoff

```javascript
const INTERVAL = 3000;
const BACKOFF = 5000;
let failRetries = 0;

async function getNewMsgs() {
  let json;
  try {
    const res = await fetch('/poll');
    json = await res.json();

    if (res.status !== 200) {
      throw new Error(
        'get msgs fail status: ' + res.status + ' time:' + new Date()
      );
    }
    failRetries = 0;
  } catch (e) {
    console.log(e);
    // add retiry time
    failRetries += 1;
  }

  allChat = json.msg;
  render();
}

async function rafGetMsgs() {
  await getNewMsgs();
  // 線性的 backoff
  await new Promise((resolve) =>
    setTimeout(resolve, INTERVAL + failRetries * BACKOFF)
  );
  window.requestAnimationFrame(rafGetMsgs);
}
```

之後當發生失敗就會延長 request 的時間。

![](../static/backoff.png)

❗ 許多 library 已經建立好 backoff、retry 的機制，只需要使用他們就好，不需要自己實現(例如 axios)。

## HTTP2

建立 HTTP/2 push，建立連線，然後的持續進行連線而不關閉它，不只返回一個 response 而是返回多個 response。

HTTP/2 必須建立在 https 上，詳細關於 HTTP/2 的介紹可以[參考](https://tw.alphacamp.co/blog/2016-07-12-http2)，所以若希望在 local 端中使用 HTTP/2 仍需要建立 SSL 的 certificate。

首先使用 homebrew 安裝 openssl

```shell
brew install openssl
```

之後使用下列命令建立 key 與 certificate

```shell
openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
```

會看到專案的目錄下多出了以下的檔案

*   root
    *   csr.pem
    *   key.pem
    *   server.crt
    *   ...

透過 node `http2` 建立 https 的連線或是其它的 library、middleware

```javascript
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http2.createSecureServer({
  cert: fs.readFileSync(path.join(__dirname, '/../server.crt')),
  key: fs.readFileSync(path.join(__dirname, '/../key.pem')),
});
```

此時就能在 localhost 使用 https 了 (若遇到 chrome NET::ERR\_CERT\_INVALID 的 Error，[參考](https://stackoverflow.com/questions/35565278/ssl-localhost-privacy-error)設定就可以解決了)。

在後端的部分需要 stream 持續的建立連接，以 node.js 的部分 code 大概會是這樣。

```javascript
// ...
let connections = [];
server.on('stream', (stream, headers) => {
  const path = headers[':path'];
  const method = headers[':method'];

  if (path === '/msgs' && method === 'GET') {
    stream.respond({
      ':status': 200,
      'content-type': 'text/plant; charset=utf8-8',
    });

    // 將已經建立連線的 stream 儲存起來
    connections.push(stream);

    stream.write(
      JSON.stringify({
        msg: getMsgs(),
      })
    );
  }

  stream.on('close', () => {
    // 移除中斷連線的 stream
    connections = connections.filter(
      (connectionStream) => connectionStream.id !== stream.id
    );
  });
});
// ...

// 當發生新增 msg 時
// ...
// trigger 將所有已經連線的 stream 寫入資料，傳送到前端
for (const connectionStream of connections) {
  connectionStream.write(JSON.stringify({ msg: getMsgs() }));
}
```

前端的部分建立 read stream，接收後端的 stream 傳來的資料。

```javascript
async function getNewMsgs() {
  let reader;
  const textDecoder = new TextDecoder('utf8');

  try {
    // 建立連線並獲取 read stream
    const resp = await fetch('/msgs');
    reader = resp.body.getReader();
  } catch (e) {
    console.log(e);
  }

  let readerResponse;
  let done = false;
  // 持續獲取 stream 內的 data
  while (!done) {
    try {
      readerResponse = await reader.read();
    } catch (e) {
      console.log('get reader fail ', e);
      break;
    }

    const chunk = textDecoder.decode(readerResponse.value, { stream: true });

    if (chunk) {
      try {
        const json = JSON.parse(chunk);
        allChat = json.msg;
        render();
      } catch (e) {
        console.log('json parse error ', e);
      }
    }

    done = readerResponse.done;
  }
}
```

就能透過 HTTP/2 進行 real time 的更新

![](../static/h2.gif)

## WebSocket

前面所提的 HTTP/2 與 Polling 並不算是真的實現 real time，HTTP/2 像是單向的由 server push 資料至 client，Polling 則是不停的發送請求獲取資料。

在 browser 端已經有了 WebSocket 的 API 可以使用(產品上還是使用成熟穩定的套件較好)，詳細文件可以[參考](https://developer.mozilla.org/zh-TW/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)。

在 node.js 上也可實現自己建立的 WebSocket，當 TCP/IP 進行交握時會告知後端要進行 **upgrade**，此時 server 就知道要使用 WebSocket，並嘗試建立 WebSocket 連線。

建立 WebSocket 連線時需要帶上使用者的 `Sec-WebSocket-Key` 與神奇的字串 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 相連，在使用 `SHA1` 的算法在進行 `base64` 丟回給使用者。

```javascript
// client
const ws = new WebSocket('ws://localhost:8080', ['json']);

ws.addEventListener('open', () => {
  console.log('open websocket port 8080');
});
```

```javascript
// backend
import crypto from "crypto";

// 產生 websocket 所需要的溝通 key
function generateAcceptValue(acceptKey) {
  return (
    crypto
      .createHash("sha1")
      // this magic string key is actually in the spec
      .update(acceptKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
      .digest("base64")
  );
}

const server = http.createServer(...);

// 接收到 upgrade 通知時，建立 websocket 連線
server.on('upgrade', (req, socket) => {
  const acceptKey = req.headers['sec-websocket-key'];
  const acceptValue = generateAcceptValue(acceptKey);

  const headers = [
    'HTTP/1.1 101 Web Socket Protocol Handshake',
    'Upgrade: WebSocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptValue}`,
    'Sec-WebSocket-Protocol: json',
    '\r\n'
  ]

  socket.write(headers.join('\r\n'));
});

```

這樣就已經建立了基本的 WebSocket 連線，Server 與 Client 即可雙向的及時溝通。

當 server 要傳遞訊息至 client 時，訊息傳送前需經過處理，首先計算傳送的的訊息有多少的 byte，建立 buffer，分次傳送 frames 至 client。

server 要接收從 client 要傳遞的 buffer 也需要經過轉換。

更多關於 websocket 的機制與實現可以參考[文章](https://medium.com/hackernoon/implementing-a-websocket-server-with-node-js-d9b78ec5ffa8)有非常詳細的解說。

```javascript
// response message
// server to client
function objToResponse(data) {
  // Convert the data to JSON and copy it into a buffer
  const json = JSON.stringify(data);
  const jsonByteLength = Buffer.byteLength(json);
  // Note: we're not supporting > 65535 byte payloads at this stage
  const lengthByteCount = jsonByteLength < 126 ? 0 : 2;
  const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126;
  const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength);
  // Write out the first byte, using opcode `1` to indicate that the message
  // payload contains text data
  buffer.writeUInt8(0b10000001, 0);
  buffer.writeUInt8(payloadLength, 1);
  // Write the length of the JSON payload to the second byte
  let payloadOffset = 2;
  if (lengthByteCount > 0) {
    buffer.writeUInt16BE(jsonByteLength, 2);
    payloadOffset += lengthByteCount;
  }
  // Write the JSON data to the data buffer
  buffer.write(json, payloadOffset);
  return buffer;
}
```

```javascript
// buffer to tex
// msg from client
function parseMessage (buffer) {
  const firstByte = buffer.readUInt8(0);
  const isFinalFrame = Boolean((firstByte >>> 7) & 0×1);
  const [reserved1, reserved2, reserved3] = [ Boolean((firstByte >>> 6) & 0×1), Boolean((firstByte >>> 5) & 0×1), Boolean((firstByte >>> 4) & 0×1) ];
  const opCode = firstByte & 0xF;
  // We can return null to signify that this is a connection termination frame
  if (opCode === 0×8)
     return null;
  // We only care about text frames from this point onward
  if (opCode !== 0×1)
    return;
  const secondByte = buffer.readUInt8(1);
  const isMasked = Boolean((secondByte >>> 7) & 0×1);
  // Keep track of our current position as we advance through the buffer
  let currentOffset = 2; let payloadLength = secondByte & 0×7F;
  if (payloadLength > 125) {
    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(currentOffset);
      currentOffset += 2;
    } else {
      // 127
      // If this has a value, the frame size is ridiculously huge!
      const leftPart = buffer.readUInt32BE(currentOffset);
      const rightPart = buffer.readUInt32BE(currentOffset += 4);
      // Honestly, if the frame length requires 64 bits, you're probably doing it wrong.
      // In Node.js you'll require the BigInt type, or a special library to handle this.
      throw new Error('Large payloads not currently implemented');
    }
  }
}
```

在後端將訊息 parse 後傳送給前端

```javascript
server.on('upgrade', (req, socket) => {
  ...

  socket.write(objToResponse({msg: getMsgs()}))
})
```

前端接受到訊息後重新 render 畫面

```javascript
ws.addEventListener('message', (res) => {
  console.log(res);
  const data = JSON.parse(res.data);
  allChat = data.msg;
  render();
});
```

前端也可以發送訊息至後端

```javascript
async function postNewMsg(user, text) {
  const data = { user, text };
  ws.send(JSON.stringify(data));
}
```

後端 parse 後，就可以正常讀取資料

```javascript
const connections = [];

server.on('upgrade', (req, socket) => {
  connections.push(socket);
  // ...
  socket.on('data', (buffer) => {
    const message = parseMessage(buffer);
    if (message) {
      msg.push({
        user: message.user,
        text: message.text,
        time: Date.now(),
      });
      // 寫入資料後在傳送資料到正在連接的 socket
      for (const conn of connections) {
        conn.write(objToResponse({ msg: getMsgs() }));
      }
    } else {
      socket.end();
    }
  });
  // 移除斷線的 socket
  socket.on('end', () => {
    connections = connections.filter((connection) => connection !== socket);
  });
});
```

## Socket IO

常見實現 WebSocket 的套件有 2 個，一是 **WS** 另一個就是 **Socket.IO**，Socket.IO 像是 WebSocket 的 FrameWork，替我們實現了許多 function，可以連接資料庫、自動替不 support WebSocket 的瀏覽器轉換成 long polling、scalable、auto reconnect 等 feature。

WS 則是簡單的 WebSocket Library，替我們實現 WebSocket。

```javascript
// backend
const server = http.createServer(...)
const io = new Server(server, {});

io.on('connection', (socket) => {
  console.log('connection ', socket.id);
  socket.on('disconnect', () => {
    console.log('disconnect');
  })
})
```

```javascript
// client
const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log('connected');
});

socket.on('disconnect', () => {
  console.log('disconnect');
});
```

這樣就成功建立了 WebSocket 的連線了，很 Cool 的是假若將前端的 WebSocket Feature 關閉的話，Socket.IO 會自動將 WebSocket 改爲 polling 的形式。

```javascript
// client
window.WebSocket = null;
```

![](../static/socket-io-polling.png)

Socket.IO 採用 Pub/Sub 的模式

```javascript
// client
socket.on('msg:get', (data) => {
  allChat = data.msg;
  render();
});
async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };
  socket.emit('msg:post', data);
}
```

```javascript
// server
io.on('connection', (socket) => {
  ...
  socket.emit('msg:get', {msg: getMsgs()})

  socket.on('msg:post', (data) => {
    msg.push(data)
    io.emit('msg:get', {msg: getMsgs()})
  })
})
```

非常的容易就達成了雙向的 Real Time 資料更新。

