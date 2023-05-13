import { URL } from 'node:url';
import { compileFile } from 'pug'; 

import pages from './pug/pages.mjs';


const
  PUGPATH = './pug/',
  paths = new Map(pages.map(page => [page.href, compileFile(PUGPATH + page.pug)]));
  // fetch node >= v18.0.0
  // https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch

export const _404 = compileFile(PUGPATH + '404.pug')();

export default function getGenFunction(request) {
  const
    urlObject = new URL(request.url, `http://${request.headers.host}`),
    url = urlObject.pathname,
    page = pages.find(({ href }) => href === url);

  if (paths.has(url)) return (obj = {}) => paths.get(url)({ pages, page,...obj });
  return null;
}