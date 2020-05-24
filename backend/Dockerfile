FROM python:3.7-alpine

COPY ./uwsgi.ini /app/

WORKDIR /app/backend

RUN apk add build-base linux-headers pcre-dev

COPY ./requirements.txt /app/backend

RUN pip3 install --upgrade setuptools
RUN pip3 install -r requirements.txt

COPY . /app/backend
