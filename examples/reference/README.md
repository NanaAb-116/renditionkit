# Reference application

This is a complete, independent RenditionKit deployment:

- Express upload and status API
- PostgreSQL asset repository
- Redis/BullMQ queue
- MinIO object storage
- separate Sharp worker with a 1 GB memory limit
- browser page that polls status and renders generated AVIF/WebP sources

Run it from this directory:

```sh
docker compose up --build
```

Open <http://localhost:4100>, upload an image, and watch it move from pending to
ready. The MinIO console is available at <http://localhost:9101> using the
development credentials in `docker-compose.yml`.

Remove the demo and its volumes with:

```sh
docker compose down --volumes
```

The credentials are local examples and must not be used for a deployed system.
