import express = require('express');
import bodyParser = require('body-parser');

export function setupServer() {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Title Generator</title>
        </head>
        <body>
          <h1> Welcome to a simple blockchain example </h1>
          <div>
            <h3>API</h3>
            <ul>
              <li>GET <a href="/mine">/mine</a></li>
              <li>GET <a href="/chain">/chain</a></li>
              <li>GET <a href="/nodes/resolve">/nodes/resolve</a></li>
              <li>POST <a href="/nodes/register">/nodes/register</a><li>
            </ul>

            <p> Enjoy! </p>
          </div>
        </body>
      </html> 
    `)
  })

  return app;
}