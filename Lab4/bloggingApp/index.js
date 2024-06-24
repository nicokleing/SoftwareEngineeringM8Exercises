const express = require('express');
const db = require('./db');
const redisClient = require('./redis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint para obtener un post
app.get('/posts/:id', (req, res) => {
  const postId = req.params.id;

  // Intentar obtener el post de Redis
  redisClient.get(`post:${postId}`, (err, post) => {
    if (err) throw err;

    if (post) {
      console.log('Cache hit');
      res.send(JSON.parse(post));
    } else {
      console.log('Cache miss');
      // Si no está en Redis, obtener el post de MySQL
      db.query('SELECT * FROM posts WHERE post_id = ?', [postId], (err, result) => {
        if (err) throw err;
        const post = result[0];

        if (post) {
          // Almacenar el post en Redis
          redisClient.setex(`post:${postId}`, 3600, JSON.stringify(post));
        }

        res.send(post);
      });
    }
  });
});

// Endpoint para crear o actualizar un post
app.post('/posts', (req, res) => {
  const { post_id, user_id, title, description, image_url } = req.body;

  const query = `
    INSERT INTO posts (post_id, user_id, title, description, image_url)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    image_url = VALUES(image_url)
  `;

  db.query(query, [post_id, user_id, title, description, image_url], (err, result) => {
    if (err) throw err;

    // Invalidar la caché en Redis
    redisClient.del(`post:${post_id}`);

    res.send('Post saved');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
