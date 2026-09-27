export const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RenditionKit reference</title>
  <style>
    :root { color-scheme: dark; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { max-width: 760px; margin: 0 auto; padding: 48px 20px; background: #0b1020; color: #e8ecf8; }
    h1 { font-size: clamp(2rem, 7vw, 4.5rem); margin-bottom: 8px; }
    p { color: #aab5cf; line-height: 1.6; }
    form, #result { background: #151c31; border: 1px solid #2b3657; border-radius: 16px; padding: 20px; margin-top: 24px; }
    input, button { font: inherit; }
    input[type=file] { display: block; margin-bottom: 16px; }
    button { border: 0; border-radius: 10px; padding: 10px 16px; background: #8b5cf6; color: white; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: .5; }
    img { display: block; width: 100%; height: auto; border-radius: 12px; margin-top: 16px; }
    code { color: #c4b5fd; }
  </style>
</head>
<body>
  <h1>RenditionKit</h1>
  <p>This page stores an original in MinIO, persists an asset in PostgreSQL,
  queues it in Redis, and waits for the separate worker to create responsive renditions.</p>
  <form id="upload">
    <input name="file" type="file" accept="image/*" required>
    <button>Process image</button>
  </form>
  <section id="result" hidden><p id="status"></p><div id="media"></div></section>
  <script>
    const form = document.querySelector('#upload');
    const result = document.querySelector('#result');
    const status = document.querySelector('#status');
    const media = document.querySelector('#media');
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    form.addEventListener('submit', async event => {
      event.preventDefault();
      form.querySelector('button').disabled = true;
      result.hidden = false;
      media.replaceChildren();
      status.textContent = 'Uploading…';
      try {
        const response = await fetch('/assets', { method: 'POST', body: new FormData(form) });
        if (!response.ok) throw new Error(await response.text());
        const created = await response.json();
        for (;;) {
          const current = await fetch('/assets/' + created.id).then(r => r.json());
          status.textContent = 'Status: ' + current.status;
          if (current.status === 'ready') {
            const formats = ['avif', 'webp'];
            const picture = document.createElement('picture');
            for (const format of formats) {
              const items = current.renditions.filter(item => item.extension === format);
              if (!items.length) continue;
              const source = document.createElement('source');
              source.type = 'image/' + format;
              source.srcset = items.map(item => item.url + ' ' + item.width + 'w').join(', ');
              picture.append(source);
            }
            const fallback = current.renditions.filter(item => item.extension === 'webp').at(-1) ?? current.renditions.at(-1);
            const image = document.createElement('img');
            image.src = fallback.url;
            image.alt = 'Processed upload';
            picture.append(image);
            media.append(picture);
            break;
          }
          if (current.status === 'failed' || current.status === 'rejected') break;
          await wait(500);
        }
      } catch (error) {
        status.textContent = error.message;
      } finally {
        form.querySelector('button').disabled = false;
      }
    });
  </script>
</body>
</html>`;
