FROM ubuntu:16.04

RUN mkdir -p /var/www/gcmgr

WORKDIR /var/www/gcmgr

# Install node
RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y nodejs npm
RUN apt-get install curl -y
RUN npm cache clean -f && npm install -g n && n 6.4.0

# Gulp
RUN npm i -g gulp

# Install mongo shell
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update
RUN apt-get install -y mongodb-org-shell
#RUN apt-get install -y mongodb-org-tools

RUN apt-get install -y vim

EXPOSE 3000
