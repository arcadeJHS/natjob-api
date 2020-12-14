import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../models/Job.interface';
import { JobsQueryString } from '../../models/JobsQueryString.interface';
import { JobsSource } from '../../models/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';

const jobsSource: JobsSource = {
  name: 'Job-Room',
  url: 'https://www.job-room.ch',
  results: []
};

// this site uses pagination with infinite scrolling
// so, to avoid to loop into pagination, set size=100
// in order to have a good chance to get all data back in a single call
const searchStartUrl = `${jobsSource.url}/jobadservice/api/jobAdvertisements/_search?page=0&size=100&sort=date_desc&_ng=aXQ=`;

// Bellinzona:
// communalCodes: 5002
// geoPoint": { "lat": 46.209, "lon": 9.007 }
const searchBodyParams = {
  "workloadPercentageMin": 10,
  "workloadPercentageMax": 100,
  "permanent": null,
  "companyName": null,
  "onlineSince": 7,
  "displayRestricted": false,
  "professionCodes": [],
  "keywords": [],
  "communalCodes": ["5002"],
  "cantonCodes": [],
  "radiusSearchRequest": {
    "geoPoint": { "lat": 46.209, "lon": 9.007 },
    "distance": 50
  }
};

const toJob = (item) => {
  const job = item.jobAdvertisement;
  const content = job.jobContent;
  const info = (content.jobDescriptions && content.jobDescriptions.length) ? content.jobDescriptions[0] : null;
  return {
    title: info ? info.title : null,
    location: content.location.city,
    publicationDate: job.publication.startDate,
    url: `${jobsSource.url}/job-search/${job.id}`,
    originalSource: content.company.name,
    originalSourceJobsUrl: content.externalUrl,
    description: info ? info.description : null
  };
};

@Injectable()
export class JobRoomService {
  private readonly logger = new Logger(JobRoomService.name);

  async findJobs(query: JobsQueryString): Promise<JobsSource> { 
    try { 
      if (!puppeteer) { 
        throw new Error('Puppeteer not available!');
      }

      const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });

      const page = await browser.newPage();

      await page.setRequestInterception(true);

      page.on('request', (req) => {
        /*
        if (req.url() == searchStartUrl) { 

        }
        */
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
          req.abort();
        }
        else {
          req.continue();
        }
      });

      // go to home page
      await page.goto(jobsSource.url, { waitUntil: 'networkidle0', timeout: 0 });

      // set JOB TYPE query param
      // suppose multiple words, separated by comma
      searchBodyParams.keywords = [];
      if (query && query.jobKeyword) {
        searchBodyParams.keywords = query.jobKeyword.split(',');
      }

      // send search request
      const items = await page.evaluate(({ searchStartUrl, searchBodyParams }) => {
        // https://github.com/facebook/react-native/issues/6025
        return fetch(searchStartUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchBodyParams)
        }).then(res => res.json());
      }, { searchStartUrl, searchBodyParams }); // params you require in the function need to be passed as a parameter (ref; https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pageevaluatepagefunction-args)

      await browser.close();

      if (!items || !items.length) {
        return jobsSource;
      }

      const jobs: Job[] = items.map(toJob);

      return {
        ...jobsSource,
        results: jobs
      };
      
    }
    catch (e) {
      this.logger.error(e.message);
      return {
        ...jobsSource,
        error: e.message
      }
    }
  }
}
