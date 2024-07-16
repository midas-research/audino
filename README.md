<h1 align="center">
  <img src="https://raw.githubusercontent.com/midas-research/audino/add-docs/docs/assets/banner.png?token=ABLJAWWDYM2BYPISPC4DRXS63IB7Y" width="600px" />
</h1>


# audino v2.0

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/midas-research/audino/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midas-research/audino/issues)

Audino v2.0 (`main` branch) is an open-source audio annotation tool sponsored by [Human Protocol](https://hmt.ai/). It represents the evolution of Audino (found in the `master` branch) and offers a range of powerful features, including transcription and labeling capabilities. These features make Audino v2.0 an ideal choice for various tasks, such as Voice Activity Detection (VAD), Diarization, Speaker Identification, Automated Speech Recognition, Emotion Recognition, and more.

🚀 *Note*: Audino v2.0 is actively under development. In the future, we plan to migrate from Audino to Audino v2.0 entirely. If you encounter any issues or have feedback, please don't hesitate to open an [issue](https://github.com/midas-research/audino/issues). Your input is valuable in helping us make Audino v2.0 even better!

## Partners ❤️

[Human Protocol](https://hmt.ai/) uses Audino as a way of adding an annotation service to the Human Protocol.

## Features 🤘
Current Features:

1. Multi-Language Support: Audino v2.0 offers multi-language support, making it versatile for diverse linguistic needs.

2. Emoji Support: Enhance your annotations with emoji support, adding expressiveness to your data.

3. User-Level Projects, Tasks, and Jobs: Easily manage your annotation projects, tasks, and jobs at the user level for improved organization and efficiency.

4. Flexible Label Creation: Enjoy the flexibility in creating and customizing labels, adapting to your specific annotation requirements.

5. Export in specific formats: Download annotated data in different format for seamless integration with other tools and platforms.

## Tutorials 🔍

We provide a set of [tutorials](./docs/tutorials.md) to guide users to achieve certain tasks. If you feel something is missing and should be included, please open an [issue](https://github.com/midas-research/audino/issues).

</br>

# Getting started

## Requirements

Please install the following dependencies to run `audino` on your system:

1. [git](https://git-scm.com/)
2. [docker](https://www.docker.com/) 
3. [docker-compose](https://docs.docker.com/compose/) 

### Clone the repository

```sh
$ git clone https://github.com/midas-research/audino.git
$ cd audino
$ git checkout main
$ git submodule update --init --recursive
```

## Installation Guide

You can either run the project on [default configuration](./docker-compose.yml) or modify them to your need.
**Note**: Before proceeding further, you might need to give docker `sudo` access or run the commands listed below as `sudo`.

**To bring up the services, run:**

```sh
$ docker compose up -d
```

Then, in browser, go to [http://localhost:8080/](http://localhost:8080/) to view the application.

You can register a user but by default, it will not have rights even to view the list of tasks. Thus you should create a superuser. The superuser can use an admin panel to assign the correct groups to the user. Please use the command below:
```sh
$ docker exec -it cvat_server bash -ic 'python3 ~/manage.py createsuperuser'
```

**To bring down the services, run:**

```sh
$ docker compose -f docker-compose.yml down
```

## Development Guide

### Server Setup

1. Install necessary dependencies: Ubuntu 22.04/20.04
     ```sh
    $ cd cvat
    $ sudo apt-get update && sudo apt-get --no-install-recommends install -y build-essential curl git redis-server python3-dev python3-pip python3-venv python3-tk libldap2-dev libsasl2-dev
    
    # Install Node.js 20
    $ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    $ sudo apt-get install -y nodejs
      ```

2. Make sure to use Python 3.10.0 or higher
    ```sh
    $ python3 --version
    ```

3. Install CVAT on your local host:
    ```sh
    $ mkdir logs keys
    $ python3 -m venv .env
    $ . .env/bin/activate
    $ pip install -U pip wheel setuptools
    $ pip install -r cvat/requirements/development.txt
    ```

4. Install Docker Engine and Docker Compose

5. Start service dependencies:
    ```sh
    $ cd ..
    # Make sure you are in audino root dir
    $ docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build cvat_opa cvat_db cvat_redis_inmem cvat_redis_ondisk cvat_server
    ```
    Note: to stop these services, use `docker compose -f docker-compose.yml -f docker-compose.dev.yml down`. You can add -v to remove the data, as well.
    
6. Apply migrations and create a super user for CVAT:
    ```sh
    $ cd cvat
    $ python manage.py migrate
    $ python manage.py collectstatic
    $ python manage.py createsuperuser
    ```

7. Run VScode from the virtual environment:
    ```sh
    $ source .env/bin/activate && code
    ```
8. Inside VScode, Open CVAT root dir
9. Select `server: debug` configuration and run it (F5) to run REST server and its workers
10. Make sure that Uncaught Exceptions option under breakpoints section is unchecked

### Frontend Setup

1. Install npm packages for UI (Make sure you are in `audino/audino-frontend` dir):
    ```sh
    $ npm install
    ```
2. Start the server on port 3000
    ```sh
    $ npm run start
    ```

## License
[MIT](https://github.com/midas-research/audino/blob/master/LICENSE) © MIDAS, IIIT Delhi
