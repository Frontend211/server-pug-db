import { createServer } from 'node:http';
import { serve, send } from 'micro';

import getGenFunction, { _404 } from './pugrouter.mjs';
import { URLSearchParams } from 'node:url';
import { parse as parseCookie } from 'cookie'; // https://www.npmjs.com/package/cookie
import DB from './mydb.mjs';


const 
  port = 3333,
  server = createServer(serve(async (request, response) => {
    console.log((new Date()).toLocaleTimeString(), request.method, request.url, 'HTTP/' + request.httpVersion);
    const 
      genFunction = getGenFunction(request),
      postData = 'POST' === request.method ? await getAndParsePostBody(request) : '', // 
      cookies = parseCookie(request.headers.cookie || ''),
      user = await getUser(cookies,postData,response);
    console.log('user=',user);
    if (genFunction) return genFunction(user);
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

async function getUser(cookies, searchParams, response) { // получаем пользователя по cookies и данным html-формы
  let user = null; // главное в этой функции
  if (Object.keys(cookies).length > 0) console.log('\t cookies: ', cookies);

  // ✔ ЧИТАЕМ cookies
  if (cookies.uid) { // проверим не залогинен ли уже пользователь?
    const testUser = await DB.getUserByCookie(cookies.uid);
    if (testUser?) {
      user = testUser;
      console.log(`\t клиент предъявил валидный cookie uid, значит это ${user.name}`);
    }
  }
  // ✔ ОБРАБОТЧИК ФОРМ !!! 
  if (searchParams.toString()) { // попросту считаем что если url.search  не пустой - значит пришли данные от формы
    console.log(`\t form data: ${searchParams}`);
    let UID,
      username = searchParams.get('username'),
      psw = searchParams.get('psw');
    if (username && psw && (UID = await DB.loginUser(username, psw))) {
      user = await DB.getUserByCookie(UID);
      response.setHeader('Set-Cookie',`uid=${UID}`);
      // responseHeaders['Set-Cookie'] = [`uid=${UID}`];  // ✔ УСТАНАВЛИВАЕМ клиенту cookie
      console.log(`\t login! ${username}|${psw} user=${user?.name}`);
    }
    if (searchParams.has('logout')) {  // если пожелаешь мы тебя разлогиним
      console.log(`\t logout! user=${user?.name}`);
      await DB.delOnlineUser(cookies.uid);
      user = null;
      response.setHeader('Set-Cookie',`uid=${UID}`);
      // responseHeaders['Set-Cookie'] = ['uid=;Max-Age=0']; // ✔ УДАЛЯЕМ cookie у клиента
    }
  }
  return user;
}


