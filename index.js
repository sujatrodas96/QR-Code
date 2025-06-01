import express from 'express';
import bodyParser from 'body-parser';
import qr from 'qr-image';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// For __dirname compatibility with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route to show the form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>QR Code Generator</title>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
    </head>
    <body class="bg-light">
      <div class="container mt-5">
        <div class="card shadow-sm p-4">
          <h2 class="text-center mb-4">QR Code Generator</h2>
          <form action="/generate" method="POST">
            <div class="mb-3">
              <label for="url" class="form-label">Enter URL:</label>
              <input type="text" class="form-control" id="url" name="url" required />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary">Generate QR Code</button>
            </div>
          </form>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Generate QR route
app.post('/generate', (req, res) => {
  const url = req.body.url;

  try {
    const qr_png = qr.imageSync(url, { type: 'png' });
    const base64Image = Buffer.from(qr_png).toString('base64');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>QR Code Result</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <style>
          .blurred-url {
            filter: blur(5px);
            user-select: none;
            pointer-events: none;
          }
        </style>
      </head>
      <body class="bg-light">
        <div class="container mt-5 text-center">
          <div class="card shadow-sm p-4">
            <h2 class="mb-3">QR Code Generated</h2>
            <p class="text-muted">
               <strong style="filter: blur(4px); user-select: none;">${url}</strong>
            </p>
            <div class="d-flex justify-content-center my-4">
              <img src="data:image/png;base64,${base64Image}" class="img-fluid border p-2" style="max-width: 300px;" />
            </div>
            <a href="/" class="btn btn-secondary">Generate Another</a>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Error generating QR code.");
  }
});

// Only needed for local development
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
