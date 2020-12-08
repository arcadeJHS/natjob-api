import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../models/Job.interface';
import { JobsQueryString } from '../../models/JobsQueryString.interface';
import { JobsSource } from '../../models/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';

const jobsSource: JobsSource = {
  name: 'Carriera.ch',
  url: 'https://www.carriera.ch/',
  results: []
};

const collectJobs = (rows: HTMLTableRowElement[]) => {
  const dataRows = Array.from(rows).reduce((out, r) => {
    const cells = r.querySelectorAll('td');
    if (cells.length) { out.push(r); }
    return out;
  }, []);

  return dataRows.map(row => {
    const publicationDate = row.querySelector('td:nth-child(1)').textContent;
    const jobref = row.querySelector('td:nth-child(3) > a');
    const url = jobref.getAttribute('href');
    const title = jobref.textContent;
    const location = row.querySelector('td:nth-child(4)').textContent;
    const sourceRef = row.querySelector('td:nth-child(2)');
    const sourceRefHref = sourceRef.querySelector('a');
    const originalSource = sourceRefHref ? sourceRefHref.querySelector('img').getAttribute('alt') : sourceRef.textContent;
    
    return {
      title,
      url,
      location,
      publicationDate,
      originalSource
    };
  })
};

const toJob = (item): Job => {
  return {
    title: item.title,
    location: item.location,
    publicationDate: item.publicationDate,
    url: item.url,
    originalSource: item.originalSource,
    originalSourceJobsUrl: null,
    description: null
  };
};

@Injectable()
export class CarrieraChService {

  private readonly logger = new Logger(CarrieraChService.name);
  
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
      page.setDefaultTimeout(0);

      await page.goto(jobsSource.url);

      // set LOCATION query param
      const selectorInputLocation = '#form-filter-location';
      await page.waitForSelector(selectorInputLocation, { visible: true });
      await page.$eval(selectorInputLocation, (el, location) => el.value = location, query.location);

      // set JOB TYPE query param
      if (query && query.jobKeyword) {
        const selectorInputJobKeyword = '#home-search-form-input';
        await page.waitForSelector(selectorInputJobKeyword, { visible: true });
        await page.$eval(selectorInputJobKeyword, (el, jobKeyword) => el.value = jobKeyword, query.jobKeyword);
      }
    
      const paginationSelector = 'main > section > div > div:nth-child(2) > a';
      const resultsListSelector = 'main.page-content section div.container table tbody';
      const submitButton = await page.waitForSelector('form[action="https://www.carriera.ch/cgi-bin/annunci_offerte_lavoro.cgi"] input[type="submit"]');
      
      await submitButton.click();
      await page.waitForNavigation();
      await page.waitForSelector(resultsListSelector, { visible: true });

      // await page.screenshot({ path: 'src/jobs/services/carriera-ch/screenshot.png', fullPage: true });
      
      // get data from page 1
      let items = [];
      items.push(...await page.$$eval(`${resultsListSelector} > tr`, collectJobs));

      // get data from remaining pages
      /*
      const pagesUrl = await page.$$eval(paginationSelector, (pages) => { 
        return pages.map(p => p.getAttribute('href'));
      });
      pagesUrl.forEach(async pageUrl => {
        await page.goto(pageUrl);
        await page.waitForSelector(resultsListSelector, { visible: true });
        items.push(...await page.$$eval(`${resultsListSelector} > tr`, collectJobs));
      });
      */
    
      await browser.close();

      if (!items || !items.length) {
        return jobsSource;
      }

      const jobs: Job[] = items.map(toJob);

      return {
        ...jobsSource,
        // results: jobsByDaysAgo(jobs, 7)
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
