import { createServer } from 'node:http';
import { serve, send } from 'micro';

import getGenFunction, { _404 } from './pugrouter.mjs';

const 
  port = 3333,
  server = createServer(serve(async (request, response) => {
    console.log((new Date()).toLocaleTimeString(), request.method, request.url, 'HTTP/' + request.httpVersion);
    const genFunction = getGenFunction(request);
    if (genFunction) return genFunction();
    send(response, 404, _404);
  }));
server.listen(port, () => console.log('server start at http://localhost:' + port));


