import { Link } from 'react-router5';

export default function Nav(){
  return <nav className='flex flex-grow justify-evenly items-start bg-blue-500'>
      <Link className='p-3' routeName="home">React</Link>
      <Link className='p-3' routeName="forum">Forum</Link>
      <a className='p-3' href="/">🚪 pug</a>
    </nav>
}