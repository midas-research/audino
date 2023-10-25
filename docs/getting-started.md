
# Getting started

## Requirements

Please install the following dependencies to run `audino` on your system:

1. [git](https://git-scm.com/) *[tested on v2.39.2]*
2. [docker](https://www.docker.com/) *[Docker version 24.0.2, build cb74dfc]* 
3. [docker-compose](https://docs.docker.com/compose/) *[Docker Compose version v2.19.1]* 

### Clone the repository

```sh
$ git clone https://github.com/midas-research/audino.git
$ cd audino
$ git checkout main
```

## Deploy

You can either run the project on [default configuration](../docker-compose.yml) or modify them to your need.
**Note**: Before proceeding further, you might need to give docker `sudo` access or run the commands listed below as `sudo`.

**To build the services, run:**

```sh
$ docker-compose -f docker-compose.yml build
```

**To bring up the services, run:**

```sh
$ docker-compose -f docker-compose.yml up
```

Then, in browser, go to [http://localhost:3000/](http://localhost:3000/) to view the application.

**To bring down the services, run:**

```sh
$ docker-compose -f docker-compose.prod.yml down
```

## Contribute to project

### Postgres Setup
Download and setup postgres on use the credentials for any postgres service on the cloud. Update the postgres configuration in `.env.run` and `docker-compose.yml` file. 

### Backend Setup
Create and activate a virtual environment in python using the following steps :-

1. Install python Package
  ```sh
$ pip install virtualenv 
  ```

2. Setup the virtual environment virtualenv <env_name>

3. Activate the virtual environment
```sh
$ source <env_name>/bin/activate
```

3. Download all the dependencies in the python environment
```sh
$ pip install -r requirements.txt
```

4. Migrate and sync postgres database based on the code.
```sh
$ python3 manage.py migrate
```

(If it throws any errors, you might consider running the makemigrations command)
```sh
$ python manage.py makemigrations
```

Finally, run the server on port 8000
```sh
$ python manage.py runserver
```

Create superuser account and add the credentials
```sh
$ python manage.py createsuperuser
```

### Frontend Setup 
Go to the frontend code directory
```sh
$ cd audino_frontend
```

Install all dependencies
```sh
$ npm i
```

Start the server on port 3000
```sh
$ npm run start
```