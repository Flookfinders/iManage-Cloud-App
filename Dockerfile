FROM node:22-alpine

LABEL version="1.0.3.0"
LABEL description="iManage Cloud image."
LABEL maintainer="Idox Software Ltd"

WORKDIR /imanage-icloud-docker/
EXPOSE 3000

COPY environments/ /imanage-icloud-docker/environments/
COPY public/ /imanage-icloud-docker/public/
COPY src/ /imanage-icloud-docker/src/
COPY *.config.js /imanage-icloud-docker/
COPY package.json /imanage-icloud-docker/

RUN npm install

CMD [ "npm", "run", "start:dev"]