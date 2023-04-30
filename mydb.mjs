import { createConnection } from 'mysql2/promise';


const
  connection = await createConnection('mysql://user:111@192.168.100.4/northwind');


  