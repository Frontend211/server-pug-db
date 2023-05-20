import { useContext } from "react";
import DataContext from "../dataContext.js";
import Post from "./Post.js";

export default function Forum(){
  const {user, posts} = useContext(DataContext);
  return<>
  {user && <form method="post" className='bg-blue-100 flex items-center flex-col gap-3 p-3'>
    <h2>Add post</h2>
    <label>Title <input name="title"/></label>
    <label>Message <textarea name="body"></textarea></label>
    <input type="hidden" name="action" value="addpost"/>
    <input type="submit" value="Add post" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
    </form>}
  {posts && posts.map(post=><Post post={post} key={post.id} />) }

  </>
}