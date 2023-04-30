import { createConnection } from 'mysql2/promise';


const
  salt = 'mySuper%SecretSalt!*&^%$#', // TODO move to .env-file 
  connection = await createConnection('mysql://user:111@192.168.100.4/myforum'),
  // eslint-disable-next-line quotes
  getUserQ = await connection.prepare(`SELECT id, login, realname 
    FROM users   
    WHERE login = ? AND psw =  PASSWORD(CONCAT('${salt}',?))`),
  // eslint-disable-next-line quotes
  newSessionQ = await connection.prepare(`INSERT INTO sessions set userId = ?,  secret = '?'`),

  getSessionQ = await connection.prepare(`SELECT users.login, users.realname 
    FROM sessions   JOIN users ON users.id= sessions.userId 
    WHERE secret = ? `),
  deleteSessionQ = await connection.prepare('delete from sessions where secret=?'),
  getAllPostsQ = await connection.prepare('SELECT posts.title, posts.body, posts.time, users.realname  from posts JOIN users ON users.id = posts.userId'),
  DB = {


    async delOnlineUser(uid) { await deleteSessionQ.execute([uid]); },

    async getUserByCookie(uid) {
      const [user] = await getSessionQ.execute([uid]);
      return user[0];
    },

    async loginUser(login, pass) {
      const [users] = await getUserQ.execute([login, pass]);
      if (login && pass & 1 === users.length) {
        const
          [user] = users,
          secret = this.newUID();
        console.log(user.id,secret);
        // await newSessionQ.execute([user.id, secret]);
        return secret;
      }
      return false;

      // const testUser = this.accounts?.[login];
      // if (pass && testUser && pass === testUser?.pass) {
      //   const UID = this.newUID();
      //   this.online[UID] = testUser;
      //   return UID;
      // }
      // return false;
    },

    newUID() { return ''+Math.random(); }
  };

export default DB;


