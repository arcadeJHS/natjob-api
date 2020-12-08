import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../models/Job.interface';
import { JobsQueryString } from '../../models/JobsQueryString.interface';
import { JobsSource } from '../../models/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';

const jobsSource: JobsSource = {
  name: 'TuttoJOB',
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
    location: item.location,
    publicationDate: item.publicationDate,
    originalSource: null,
    originalSourceJobsUrl: null
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
      
      const items = await page.$$eval(`${resultsListSelector} > table > tbody > tr`, (rows) => {
        return rows.map(row => {
          const href = row.querySelector('td > a');
          const url = href.getAttribute('href');
          const dataDivs = row.querySelectorAll('td > a > div');
          const title = href.querySelector('div:nth-child(1)').textContent;
          const description = (dataDivs.length === 3) ? href.querySelector('div:nth-child(2)').textContent : title;

          const locationAndDateDiv = href.querySelector(`div:nth-child(${dataDivs.length})`);
          const location = locationAndDateDiv.querySelector('div:nth-child(1) > div').textContent;
          const publicationDateString = locationAndDateDiv.querySelector('div:nth-child(2)').textContent;

          let date = new Date();
          if (~publicationDateString.indexOf('giorn')) {
            const daysNumber = Number(publicationDateString.replace('da', '').replace('giorno', '').replace('giorni', '').trim());
            date.setDate(date.getDate() - daysNumber);
          }
          
          return {
            title,
            description,
            url,
            location,
            publicationDate: date.toISOString().slice(0, 10)
          };
        })
      });
    
      await browser.close();

      if (!items || !items.length) {
        return jobsSource;
      }

      const jobs: Job[] = items.map(toJob);

      return {
        ...jobsSource,
        results: jobsByDaysAgo(jobs, 7)
      };
    }
    catch (e) {
      this.logger.error(e);
      return e;
    }
  }

}
