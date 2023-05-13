import { createServer } from 'node:http';
import { URLSearchParams } from 'node:url';

import { serve, send } from 'micro';
import { parse as parseCookie } from 'cookie'; // https://www.npmjs.com/package/cookie

import getPugGenFunction, { _404 } from './pugrouter.mjs';
import getSSRGenFunction from './_dest/ssr-router.js';

import DB from './mydb.mjs';


const
  port = 3333,
  server = createServer(serve(async (request, response) => {
    console.log((new Date()).toLocaleTimeString(), request.method, request.url, 'HTTP/' + request.httpVersion);
    const
      genPugFunction = getPugGenFunction(request),
      postData = 'POST' === request.method ? await getAndParsePostBody(request) : null,
      cookies = request.headers.cookie ? parseCookie(request.headers.cookie) : null,
      user = cookies?.uid || postData ? await getUser(cookies, postData, response) : null,
      posts = /forum$/.test(request.url) ? await DB.getAllPosts(): [], // тут надо придумать что-то получше
      data = { user, posts };
    if (genPugFunction) return genPugFunction(data);
    try {
      const
        genRSSRFunc = await getSSRGenFunction(request),
        html = genRSSRFunc(data);
      if (html) return html;
    } catch (error) {
      console.error('getSSRGenFunction error ', error);
    }    
    send(response, 404, _404);
  }));
server.listen(port, () => console.log('server start at http://localhost:' + port));

async function getAndParsePostBody(request) {
  // обработка POST запроса  сложнее чем GET, необходимо асинхронно работать с nodejs Stream см. https://habr.com/ru/post/479048/
  // суть в том что request это экземпляр класса http.ClientRequest см https://nodejs.org/api/http.html#http_class_http_clientrequest
  // который, в свою очередь наследован от Readable Stream см https://nodejs.org/api/stream.html#stream_stream
  // пример из документации: https://nodejs.org/api/stream.html#stream_api_for_stream_consumers
  // еще пример: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/#request-body
  request.setEncoding('utf8'); // Get the data as utf8 strings. If an encoding is not set, Buffer objects will be received.    
  const body = await new Promise(resolve => {
    let buff = '';
    request
      .on('data', chunk => buff += chunk)
      .on('end', () => resolve(buff));
  });
  return new URLSearchParams(body); //  🌟 применили интерфейс URLSearchParams() для POST form data
}

async function getUser(cookies, postData, response) { // получаем пользователя по cookies и данным html-формы
  console.log('\t🐌 getUser');
  let userId = null; // главное в этой функции
  if (cookies && Object.keys(cookies).length > 0) console.log('\t\t cookies: ', cookies);

  // ✔ ЧИТАЕМ cookies
  if (cookies?.uid) { // проверим не залогинен ли уже пользователь?
    const testUserId = await DB.getUserByCookie(cookies.uid);
    if (testUserId) {
      userId = testUserId;
      console.log(`\t\t\t клиент предъявил валидный cookie uid, id = ${userId}`);
    }
  }

  // ✔ ОБРАБОТЧИК ФОРМ !!! 
  if (postData) console.log(`\t\t form data: ${postData}`);
  switch (postData?.get('action')) {
    case 'login':
      // eslint-disable-next-line no-case-declarations
      const
        username = postData.get('username'),
        psw = postData.get('psw'),
        [id, secret] = await DB.loginUser(username, psw);

      if (username && psw && id && secret) {
        userId = id;
        response.setHeader('Set-Cookie', `uid=${secret}`); // ✔ УСТАНАВЛИВАЕМ клиенту cookie
        console.log(`\t\t\t login id = ${userId}`);
      }
      break;

    case 'logout':
      console.log(`\t\t\t logout id=${userId}`);
      await DB.delOnlineUser(cookies?.uid);
      userId = null;
      response.setHeader('Set-Cookie', `uid=${cookies?.uid};Max-Age=0`); // ✔ УДАЛЯЕМ cookie у клиента
      break;

    case 'addpost':
      console.log(`\t\t\t addpost id=${userId}`);
      if (userId) // проверим что может писать посты 
        await DB.newPost(...['title','body'].map(v=>postData.get(v),userId),userId);
      break;
  }
  console.log('\tgetUser=',userId);
  if (userId) return await DB.getUserData(userId);
  return null;
}


