import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../models/Job.interface';
import { JobsQueryString } from '../../models/JobsQueryString.interface';
import { JobsSource } from '../../models/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';

const jobsSource: JobsSource = {
  name: 'TuttoJOB.ch',
  url: 'https://www.tuttojob.ch',
  results: []
};

// idZona       => 230 = Ticino
// idDistretto  => 107 = Bellinzona
let searchStartUrl = `${jobsSource.url}/search/?idFunzioni=0&idSettori=0&idContratti=0&idOccupazione=0&idZona=230&idDistretto=107`;

const toJob = (item) => {
  return {
    title: item.title,
    description: item.description,
    url: `${jobsSource.url}/${item.url}`,
    location: null,
    publicationDate: null,
    originalSource: null,
    originalSourceJobs: null
  };
};

@Injectable()
export class TuttojobService {

  private readonly logger = new Logger(TuttojobService.name);
  
  async findJobs(query: JobsQueryString): Promise<JobsSource> {
    try {
      if (!puppeteer) {
        throw new Error('Puppeteer not available!');
      }

      const browser = await puppeteer.launch({
        dumpio: true,
        args: ['--no-sandbox']
      });

      const page = await browser.newPage();

      // set JOB TYPE query param
      if (query && query.jobKeyword) {
        searchStartUrl = `${searchStartUrl}&searchText=${query.jobKeyword}`;
      }

      await page.goto(searchStartUrl);

      const resultsListSelector = '#modeSearchViewList';
      await page.waitForSelector(resultsListSelector, { visible: true });
      const rows = await page.$$eval(`${resultsListSelector} > table > tbody > tr`, rows => rows.map(row => {
        const href = row.querySelector('td > a');
        const url = href.getAttribute('href');
        const title = href.querySelector('div:nth-child(1)').textContent;
        const description = href.querySelector('div:nth-child(2)').textContent;

        return {
          title,
          description,
          url
        };
      }));

      console.log(rows);
    
      await browser.close();

      if (!rows || !rows.length) {
        return jobsSource;
      }

      const jobs: Job[] = rows.map(toJob);

      return {
        ...jobsSource,
        results: jobs
      };
    }
    catch (e) {
      this.logger.log(e);
      return e;
    }
  }

}
