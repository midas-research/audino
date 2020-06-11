<h1 align="center">
  <img src="https://raw.githubusercontent.com/midas-research/audino/add-docs/docs/assets/banner.png?token=ABLJAWWDYM2BYPISPC4DRXS63IB7Y" width="600px" />
</h1>


# audino

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/midas-research/audino/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./docs/getting-started.md#development)

audino is an open source audio annotation tool. It provides features such as transcription and labeling which enables annotation for Voice Activity Detection (VAD), Diarization, Speaker Identification, Automated Speech Recognition, Emotion Recognition tasks and more. 

## Features

Current features of the tool include:

1. Multi-language support
2. Collaborative annotation
3. JWT based authentication
4. User-level project, role and data assignment
5. Project-level API Key based datapoint creation
6. Emoji support
7. Flexibility in label creation

## Usage

*Note: Please see [getting started](docs/getting-started.md) guide for configurations and concrete usage.*

Please install the following dependencies to run `audino` on your system:

1. [git](https://git-scm.com/) *[tested on v2.23.0]*
2. [docker](https://www.docker.com/) *[tested on v19.03.8, build afacb8b]*
3. [docker-compose](https://docs.docker.com/compose/) *[tested on v1.25.5, build 8a1c60f6]*

### Clone the repository

```sh
$ git clone https://github.com/midas-research/audino.git
$ cd audino
```

### For Production

You can either run the project on [default configuration](./docker-compose.prod.yml) or modify them to your need.

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

### For Development

Similar to `production` setup, you need to use development [configuration](./docker-compose.dev.yml) for working on the project, fixing bugs and making contributions.

**To build the services, run:**

```sh
$ docker-compose -f docker-compose.dev.yml build
```

**To bring up the services, run:**

```sh
$ docker-compose -f docker-compose.dev.yml up
```

Then, in browser, go to [http://localhost:3000/](http://localhost:3000/) to view the application.

**To bring down the services, run:**

```sh
$ docker-compose -f docker-compose.dev.yml down
```

## Tutorials

We provide a set of [tutorials](./docs/tutorial.md) to guide users to acheive certain tasks. If you feel something is missing and should be included, please open an [issue](https://github.com/midas-research/audino/issues).

## Citation

Currently, the [paper](https://arxiv.org/abs/2006.05236) is under review. For now, please cite it as:

```
@misc{grover2020audino,
    title={audino: A Modern Annotation Tool for Audio and Speech},
    author={Manraj Singh Grover and Pakhi Bamdev and Yaman Kumar and Mika Hama and Rajiv Ratn Shah},
    year={2020},
    eprint={2006.05236},
    archivePrefix={arXiv},
    primaryClass={cs.SD}
}
```

## License
[MIT](https://github.com/midas-research/audino/blob/master/LICENSE) © MIDAS, IIIT Delhi
