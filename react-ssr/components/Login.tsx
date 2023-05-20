import { useContext } from "react";
import DataContext from "../dataContext.js";


export default function Login() {
  const {user} = useContext(DataContext);
  return <form method="post" className='bg-blue-100 flex items-center flex-col gap-3 p-3'>
    {user
      ? <>
        <h2>Hello, {user.realname}</h2>
        <input type="hidden" name="action" value="logout" />
      </>
      : <>
        <label>Name<input name="username"/></label>
        <label>Password<input name="psw" type="password" /></label>
        <input type="hidden" name="action" value="login" />
      </>
    }
    <input type="submit" value={user ? 'Logout' : undefined} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
  </form>;
}