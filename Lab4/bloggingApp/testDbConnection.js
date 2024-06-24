const mysql = require('mysql2');

// Configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Reemplaza con tu nombre de usuario
  password: '85838583',  // Reemplaza con tu contraseña
  database: 'mydb'
});

// Conectar a la base de datos
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  // Realizar una consulta simple
  connection.query('SELECT 1 + 1 AS solution', (err, results, fields) => {
    if (err) throw err;
    console.log('The solution is: ', results[0].solution);

    // Cerrar la conexión
    connection.end(err => {
      if (err) {
        console.error('Error ending the connection:', err);
      }
      console.log('Connection closed');
    });
  });
});
