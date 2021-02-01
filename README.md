# natjob-api

This project borns to help a friend of mine: she was struggling to find a job. So the idea to experiment a little bit with [Puppeteer](https://pptr.dev/), to have fun, learn something new, and... sure, maybe scrape a bit through portals offering jobs to help her.

It is composed by two parts:
- a _backend REST API_ written in [Nest](https://github.com/nestjs/nest) (this repo)
- a _frontend client application_, [natjob-webclient](https://github.com/arcadeJHS/natjob-webclient), written with [Vue 3.0](https://v3.vuejs.org/) and [tailwindcss](https://tailwindcss.com/)

> App demo: http://natjob.matteopiazza.wtf/#/

## Installation

```bash
$ npm install
#or
$ yarn install
```

## Configuring the app
Each part (backend and frontend) should behave, and needs to be configured and hosted, as an independent application.
You need to enable CORS by setting the environment variable `WEBCLIENT_ORIGIN`:

``` javascript
// file: /src/main.ts

app.enableCors({
    origin: process.env.WEBCLIENT_ORIGIN
});
```

You can use a .env file, as in the repo's example, or configure your environment variable as you prefer.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Navigate to `{{your domain}}/jobs` to test the API and check the returned json. 

## How the code is organized

The main controller `jobs` is located under `/src/jobs`.
Each scraped website has its own nuances (a different HTML structure, or AJAX strategy to look for , and list, jobs ads.
So the `/src/jobs/services` folder help in organizing the code for the respective web pages.

Each job is defined through a Typescript interface:

```typescript
export interface Job {
  title: string,                // job title, as exposed by the original source
  location: string              // location of the offered job,
  publicationDate: string,      // online since
  url: string,                  // original job link from website
  originalSource: string,       // job original source
  originalSourceJobsUrl: string,   // original source jobs list page
  description: string           // job extended description
}
```

And then collected and grouped in the `results` property of the `JobSource` interface, which is used to normalize different outputs from different pages, and send a common json to the client app:

```typescript 
import { Job } from './Job.interface';

export interface JobsSource {
  name: string,           // website name
  url: string,            // base website url
  results: Job[],
  error?: string
}
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Credits
<p align="left">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="100" alt="Nest Logo" /></a>
</p>

## License

  [MIT licensed](LICENSE).
