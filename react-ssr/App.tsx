import { useRoute } from 'react-router5';

import Nav from './components/Nav.js';
import Forum from './components/Forum.js';
import Login from './components/Login.js';



function Main() {
  const { route } = useRoute();
  switch (route?.name) {
    case 'home':
      return <h1 className='text-4xl'>Home</h1>;
    case 'forum':
      return <>
        <h1 className='text-4xl'>Forum</h1>
        <Forum />
      </>;
    default:
      return <h1>Not Found {route.name}</h1>;
  }
}


export default function App() {
  return <>
    <header className='flex flex-wrap justify-between items-start'>
      <Nav />
      <Login />
    </header>
    <main className='container mx-auto'><Main /></main>
    <footer></footer>
  </>;
}
