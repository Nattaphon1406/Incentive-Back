#select Image
#FROM node:10.0.0-alpine
FROM node:15.4.0-alpine3.10

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# To handle 'not get uid/gid'
RUN npm config set unsafe-perm true

# RUN apk update && \
#  apk add --no-cache tzdata

#RUN -e TZ=Asia/Bangkok alpine date

RUN apk add --no-cache tzdata

ENV TZ Asia/Bangkok

# Install app dependencies
COPY ./out /usr/src/app

RUN npm install

RUN npm install pm2 -g

# RUN NODE_ENV=production
EXPOSE 3000
CMD ["pm2-runtime", "ecosystem.config.js","--env","production"]
# CMD [ "npm", "start" ]