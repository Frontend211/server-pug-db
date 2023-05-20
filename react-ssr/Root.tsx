import { RouterProvider } from 'react-router5';
import App from './App.js';
import DataContext from './dataContext.js';



// if ('object' === typeof navigator) router.start();

export default function Root({ router, user, posts }) {
  return <RouterProvider router={router}>
    <DataContext.Provider value={ {user, posts} } >
      <App />
    </DataContext.Provider>
  </RouterProvider>;
}