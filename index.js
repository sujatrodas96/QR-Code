import express from 'express';
import bodyParser from 'body-parser';
import qr from 'qr-image';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// For __dirname compatibility with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));

// Sanitize filename
function sanitizeFilename(url) {
  return url
    .replace(/https?:\/\//, '')
    .replace(/[\/:?&=]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .substring(0, 100);
}

app.post('/generate', (req, res) => {
  const url = req.body.url;
  const safeFilename = sanitizeFilename(url);
  const fileName = `${safeFilename}.png`;
  const filePath = path.join(__dirname, 'qrcodes', fileName);

  if (!fs.existsSync(path.join(__dirname, 'qrcodes'))) {
    fs.mkdirSync(path.join(__dirname, 'qrcodes'));
  }

  const qr_svg = qr.image(url);
  const stream = fs.createWriteStream(filePath);
  qr_svg.pipe(stream);

  stream.on('finish', () => {
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
      </head>
      <body class="bg-light">
        <div class="container mt-5 text-center">
          <div class="card shadow-sm p-4">
            <h2 class="mb-3">QR Code Generated</h2>
            <p class="text-muted">For: <strong>${url}</strong></p>
           <div class="d-flex justify-content-center my-4">
            <img src="/qrcodes/${fileName}" class="img-fluid border p-2" style="max-width: 300px;" />
           </div>
            <br />
            <a href="/" class="btn btn-secondary">Generate Another</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
