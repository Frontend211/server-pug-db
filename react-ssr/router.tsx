import {createRouter,cloneRouter} from 'router5';


const routes = [
  { name: 'home', path: '/react-home' },
  { name: 'forum', path: '/react-forum' },
  { name: '404', path: '/404' }
],

router = createRouter(routes);



export default _=> cloneRouter(router);