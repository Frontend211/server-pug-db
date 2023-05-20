import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import cloneRouter from './router.js';
import Root from './Root.js';


const
  html = readFileSync('./react-ssr/index.template.html', 'utf8');

function getHtml(content) {
  return html
    .replace('$$$', renderToString(content));
}



export default function getGenFunction(request) {
  return new Promise((resolve, reject) => {
    const router = cloneRouter();
    router.start(request.url, async (error, state) => {
      // console.log('done callback',error,state);
      if (error)
        reject(error)
      else
        resolve(data=>getHtml(Root(Object.assign(data,{router}))));
    });
  });
}