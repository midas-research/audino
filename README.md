<h1 align="center">
  <img src="https://raw.githubusercontent.com/midas-research/audino/add-docs/docs/assets/banner.png?token=ABLJAWWDYM2BYPISPC4DRXS63IB7Y" width="600px" />
</h1>


# audino v2

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/midas-research/audino/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midas-research/audino/issues)

Audino v2 (`main` branch) is an open-source audo annotation tool sponsored by [Human Protocol](https://hmt.ai/). It represents the evolution of Audino (found in the `master` branch) and offers a range of powerful features, including transcription and labeling capabilities. These features make Audino v2 an ideal choice for various tasks, such as Voice Activity Detection (VAD), Diarization, Speaker Identification, Automated Speech Recognition, Emotion Recognition, and more.

🚀 *Note*: Audino v2 is actively under development. In the future, we plan to migrate from Audino to Audino v2 entirely. If you encounter any issues or have feedback, please don't hesitate to open an [issue](https://github.com/midas-research/audino/issues). Your input is valuable in helping us make Audino v2 even better!

## Partners ❤️

[Human Protocol](https://hmt.ai/) uses Audino as a way of adding annotation service to the Human Protocol.

## Features 🤘
Current Features:

1. Multi-Language Support: Audino v2 offers multi-language support, making it versatile for diverse linguistic needs.

2. Emoji Support: Enhance your annotations with emoji support, adding expressiveness to your data.

3. User-Level Projects, Tasks, and Jobs: Easily manage your annotation projects, tasks, and jobs at the user level for improved organization and efficiency.

4. Flexible Label Creation: Enjoy flexibility in creating and customizing labels, adapting to your specific annotation requirements.

5. Export in JSON Format: Download annotated data in JSON format for seamless integration with other tools and platforms.

## Tutorials 🔍

We provide a set of [tutorials](./docs/tutorials.md) to guide users to achieve certain tasks. If you feel something is missing and should be included, please open an [issue](https://github.com/midas-research/audino/issues).

</br>

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

You can either run the project on [default configuration](./docker-compose.yml) or modify them to your need.
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
Download and setup postgres on your machine or use the credentials for any postgres service on the cloud. Update the postgres configuration in `.env`.

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

4. Download all the dependencies in the python environment
```sh
$ pip install -r requirements.txt
```

5. Download psycopg2-binary package for connecting to postgresql easily.
```sh
$ pip install psycopg2-binary
```

6. Migrate and sync postgres database based on the code.
```sh
$ python3 manage.py migrate
```

(If it throws any errors, you might consider running the makemigrations command)
```sh
$ python manage.py makemigrations
```

7. Finally, run the server on port 8000
```sh
$ python manage.py runserver
```

8. Create superuser account and add the credentials
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

## License
[MIT](https://github.com/midas-research/audino/blob/master/LICENSE) © MIDAS, IIIT Delhi
