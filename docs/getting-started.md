# Getting started

## Requirements

Please install the following dependencies to run `audino` on your system:

1. [git](https://git-scm.com/) *[tested on v2.23.0]*
2. [docker](https://www.docker.com/) *[tested on v19.03.8, build afacb8b]*
3. [docker-compose](https://docs.docker.com/compose/) *[tested on v1.25.5, build 8a1c60f6]*

### Clone the repository

```sh
$ git clone https://github.com/midas-research/audino.git
$ cd audino
```

### Production

#### Configuration
There is a [default production configuration](../docker-compose.prod.yml) which can be directly used for building and running the tool. This configuration can be modified based on your requirement as follows:

**`backend` service:**

*Environment Variables:*

1. `ADMIN_USERNAME`: Username for admin user (defaults to `admin`)
2. `ADMIN_PASSWORD`: Password for admin user (defaults to `password`)
3. `DATABASE_URL`: SQLAlchemy Database URL (currently only MySQL database is supported)
4. `JWT_SECRET_KEY`: JSON Web Token Secret key
5. `JWT_REDIS_STORE_URL`: JSON Web Token Redis Store URL

*Volumes:*

Audio datapoints uploaded are stored in `/root/uploads` folder inside docker container and mounted to `backend_data` volume. You can change this and mount host server volume instead.

**`mysql` service:**

*Environment Variables:*

1. `MYSQL_DATABASE`: MySQL Database name. Defaults to `audino`. If changed, you need to change database name in `../mysql/create_database.sql`.
2. `MYSQL_ROOT_PASSWORD`: Password for `root` user. Defaults to `root`.
3. `MYSQL_USER`: Application user to be created for `MYSQL_DATABASE`. *Note: `DATABASE_URL` in `backend` service should reflect this change*
4. `MYSQL_PASSWORD`: Application user's password. *Note: `DATABASE_URL` in `backend` service should reflect this change*

*Volumes:*

MySQL data is stored in `/var/lib/mysql` folder inside docker container and mounted to `mysql_prod_data` volume. You can change this and mount host server volume instead.

**`redis` service:**

*Environment Variables:*

1. `REDIS_PASSWORD`: Password for redis store. Defaults to `audino`. *Note: `JWT_REDIS_STORE_URL` in `backend` service should reflect this change*

*Volumes:*

Redis data is stored in `/data` folder inside docker container and mounted to `redis_data` volume. You can change this and mount host server volume instead.

#### Running

**To build the services, run:**

```sh
$ docker-compose -f docker-compose.prod.yml build
```

**To bring up the services, run:**

```sh
$ docker-compose -f docker-compose.prod.yml up
```

Then, in browser, go to [http://0.0.0.0/](http://0.0.0.0/) to view the application.

**To bring down the services, run:**

```sh
$ docker-compose -f docker-compose.prod.yml down
```

### Development

Similar to `production` setup, you need to use development [configuration](./docker-compose.dev.yml) for working on the project, fixing bugs and making contributions.

#### Running

**To build the services, run:**

```sh
$ docker-compose -f docker-compose.dev.yml build
```

**To bring up the services, run:**

```sh
$ docker-compose -f docker-compose.dev.yml up
```

Then, in browser, go to [http://localhost:3000/](http://localhost:3000/) to view the application. API is served on [http://localhost:5000/](http://localhost:5000/)

**To bring down the services, run:**

```sh
$ docker-compose -f docker-compose.dev.yml down
```
