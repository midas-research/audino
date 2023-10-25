FROM python:3.11.6-alpine

ENV PYTHONUNBUFFERED 1
RUN mkdir /audino-app
WORKDIR /audino-app
COPY . .
RUN apk add --update --no-cache postgresql-client jpeg-dev
RUN apk add --update --no-cache --virtual .tmp-build-deps gcc libffi-dev libc-dev linux-headers postgresql-dev musl-dev zlib zlib-dev python3-dev
RUN pip install psycopg2-binary
RUN pip install -r requirements.txt

RUN adduser -D user
USER user