<h1 align="center">
  <img src="https://raw.githubusercontent.com/midas-research/audino/add-docs/docs/assets/banner.png?token=ABLJAWWDYM2BYPISPC4DRXS63IB7Y" width="600px" />
</h1>


# audino v2

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/midas-research/audino/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/getting-started.md#development)

audino v2(`main` branch) is an open source audio annotation tool sponsored by [Human Protocol](https://hmt.ai/) which is the continuation of audino (`master` branch). It provides features such as transcription and labeling which enables annotation for Voice Activity Detection (VAD), Diarization, Speaker Identification, Automated Speech Recognition, Emotion Recognition tasks and more.

❗️Audino v2 is still in development and in future we will migrate v1 to v2 entirely. If you encounter any problems please feel free to raise an [issue](https://github.com/midas-research/audino/issues).

## Partners ❤️

[Human Protocol](https://hmt.ai/) uses Audino as a way of adding annotation service to the Human Protocol.

## Features 🤘

Current features of the tool include:

1. Multi-language support
2. Emoji support
3. User-level Projects, Tasks, and Jobs
4. Flexibility in label creation
5. Download the annotated data in json format


## Tutorials

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

## License
[MIT](https://github.com/midas-research/audino/blob/master/LICENSE) © MIDAS, IIIT Delhi
