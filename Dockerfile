# syntax=docker/dockerfile:1
# escape=`

FROM node:22-alpine

LABEL description="iManage Cloud App."
LABEL version="1.0.5.0"
LABEL maintainer="Idox Software Ltd"

WORKDIR /imanage-icloud-docker
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm ci
COPY . ./
EXPOSE 3000

CMD [ "npm", "run", "start"]
