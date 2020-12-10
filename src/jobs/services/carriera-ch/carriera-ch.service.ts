import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../models/Job.interface';
import { JobsQueryString } from '../../models/JobsQueryString.interface';
import { JobsSource } from '../../models/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';
import { jobsByKeyword } from '../../utillities/jobsByKeyword.filter';

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

      // https://stackoverflow.com/questions/50931956/how-to-increase-navigation-timeout-when-running-puppeteer-tests-with-jest
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
      // optimize resource requests
      // https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pagesetrequestinterceptionvalue
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'script') {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(jobsSource.url, { waitUntil: 'networkidle0', timeout: 0 });

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
    
      const resultsListSelector = 'main.page-content section div.container table tbody';
      const submitButton = await page.waitForSelector('form[action="https://www.carriera.ch/cgi-bin/annunci_offerte_lavoro.cgi"] input[type="submit"]');
      
      await submitButton.click();
      await page.waitForNavigation();
      await page.waitForSelector(resultsListSelector, { visible: true });
      
      // get data from page 1
      let items = [];
      items.push(...await page.$$eval(`${resultsListSelector} > tr`, collectJobs));

      // get data from remaining pages
      const paginationSelector = 'main > section > div > div:nth-child(2) > a';

      const pagesUrl = await page.$$eval(paginationSelector, (pages) => { 
        return pages.map(p => p.getAttribute('href'));
      });

      for (let i = 0; i < pagesUrl.length; i++) {
        items = items.concat(await getPagesData(pagesUrl[i]));
      }

      async function getPagesData(pageUrl) {
        // avoid async race condistions
        // https://pptr.dev/#?product=Puppeteer&version=v5.5.0&show=api-pageclickselector-options
        // https://github.com/puppeteer/puppeteer/issues/1412
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          page.goto(pageUrl),
          page.waitForSelector(resultsListSelector, { visible: true })
        ]);
        return await page.$$eval(`${resultsListSelector} > tr`, collectJobs);
      }
    
      await browser.close();

      if (!items || !items.length) {
        return jobsSource;
      }

      let jobs: Job[] = items.map(toJob);
      jobs = jobsByDaysAgo(jobs, 7);
      jobs = jobsByKeyword(jobs, query.jobKeyword);
      jobs = jobs.filter(j => !~j.location.toUpperCase().indexOf('ITALIA'));  // filter out not relevant "jobs in Italy"

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
