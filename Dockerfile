FROM tiangolo/uwsgi-nginx-flask:python3.7

COPY ./requirements.txt /app

RUN pip install -r requirements.txt

COPY . /app
