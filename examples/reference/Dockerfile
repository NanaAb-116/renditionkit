FROM node:22-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages ./packages
COPY examples/reference ./examples/reference
RUN pnpm install --frozen-lockfile
RUN pnpm build

CMD ["node", "examples/reference/dist/api.js"]
