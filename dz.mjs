import { createServer } from 'node:http';
import { URL } from 'node:url';
import { parse } from 'node:path';

import { createConnection } from 'mysql2/promise';

// https://nodejs.org/dist/latest-v18.x/docs/api/cli.html#--watch 
// >=18.11.0

const 
  port = 3333,
  connection = await createConnection('mysql://user:111@192.168.100.4/northwind'),
  [tableList] = await connection.execute('SHOW TABLES'),
  // eslint-disable-next-line quotes
  checkQ = await connection.prepare(`CALL sys.table_exists('northwind', ? , @exists)`),
  checkResultQ = await connection.prepare('SELECT @exists; '),
  server = createServer(async (request, response) => {
    console.log((new Date()).toLocaleTimeString(), request.method, request.url, 'HTTP/' + request.httpVersion);
    if ('/' === request.url) {
      response.end(tableList.map(el => Object.values(el)[0]).map(str => str.link('/' + str)).join('<br>'));
      return;
    }
    let
      urlObject = null,
      path = null,
      table = null,
      check = false;
    try {
      urlObject = new URL(request.url, `http://${request.headers.host}`);
      path = parse(urlObject.pathname);
      table = path.base;
      await checkQ.execute([table]);
      check = 'BASE TABLE' === (await checkResultQ.execute())[0][0]['@exists'];
    } catch (err) {
      console.error('ERROR <<', err, '>>\n');
    }
    if (check) {
      const [result] = await connection.execute('select * from ' + table);
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify(result));
      return;
    }
    response.statusCode = 404;
    response.end('not found ' + table);
  });

server.listen(port, () => console.log('server start at http://localhost:' + port));
