export default function Post({post:{title,body,realname,time}}){
  // console.log({title,body,realname,time});
  return <fieldset className="border m-2 p-2">
    <legend>{realname}</legend>
    <h4>{title}</h4>
    <p>{body}</p>
    <small>{time?.toString()}</small>
  </fieldset>
}