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

RUN adduser --disabled-password --gecos '' user
USER user

ENV POSTGRES_USER=contact
ENV POSTGRES_PASSWORD=AQYjs5IzN8Ld
ENV POSTGRES_DB=audino
ENV POSTGRES_HOST="ep-solitary-resonance-25353924.eu-central-1.aws.neon.tech"

RUN python manage.py migrate
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]