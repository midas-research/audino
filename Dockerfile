FROM python:3.11-slim-buster

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENV PATH="/py/bin:$PATH"

RUN mkdir /audino-app
WORKDIR /audino-app
COPY . .
RUN apt-get update && apt-get install -y postgresql-client gcc libffi-dev libc-dev libpq-dev zlib1g zlib1g-dev
RUN pip install psycopg2-binary
RUN pip install -r requirements.txt

EXPOSE 8000 

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]