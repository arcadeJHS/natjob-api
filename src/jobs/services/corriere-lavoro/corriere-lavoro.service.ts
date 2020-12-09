import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../models/Job.interface';
import { JobsQueryString } from '../../models/JobsQueryString.interface';
import { JobsSource } from '../../models/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';

const jobsSource: JobsSource = {
  name: 'Corriere Lavoro',
  url: 'https://bancadati.corrierelavoro.ch',
  results: []
};

const searchStartUrl = `
  ${jobsSource.url}/job/searchJobs.php?
  height=340&language=it&color1=333&color2=f1f1f1&textcolor=000000&widgetversion=horizontal&searchType=0&hideCompanyFilter=1&country=214&region=3115`;

const toJob = (item) => {
  return {
    title: item.adName,
    location: item.city,
    publicationDate: `${item.date.slice(-4)}-${item.date.slice(3,5)}-${item.date.slice(0,2)}`,
    url: item.adId.replace('..', jobsSource.url),
    originalSource: item.empName,
    originalSourceJobsUrl: `${jobsSource.url}${item.empPage}`,
    description: item.desc
  };
};

@Injectable()
export class CorriereLavoroService {

  private readonly logger = new Logger(CorriereLavoroService.name);
  
  async findJobs(query: JobsQueryString): Promise<JobsSource> {
    try {
      if (!puppeteer) { 
        throw new Error('Puppeteer not available!');
      }

      const browser = await puppeteer.launch({
        args: ['--no-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(searchStartUrl);

      // set LOCATION query param
      const selectorInputLocation = 'input[name="cand_search-job_city"]';
      await page.waitForSelector(selectorInputLocation, { visible: true });
      // await page.type(selectorInputLocation, query.location);
      await page.$eval(selectorInputLocation, (el, location) => el.value = location, query.location);

      // set MAX DISTANCE query param
      const selectorInputMaxDistance = 'input[name="cand_search-max_distance"]';
      await page.waitForSelector(selectorInputMaxDistance);
      await page.$eval(selectorInputMaxDistance, (el, distance) => el.value = distance, query.maxDistance);

      // set JOB TYPE query param
      if (query && query.jobKeyword) {
        const selectorInputJobKeyword = 'input[name="cand_search-keyword"]';
        await page.waitForSelector(selectorInputJobKeyword, { visible: true });
        // await page.type(selectorInputJobKeyword, query.jobKeyword);
        await page.$eval(selectorInputJobKeyword, (el, jobKeyword) => el.value = jobKeyword, query.jobKeyword);
      }

      await page.click('#submit');
    
      const ajaxSearchResponse = await page.waitForResponse('https://bancadati.corrierelavoro.ch/ajax/common/ajax_search.php');
      const items = await ajaxSearchResponse.json();
    
      await browser.close();

      if (!items || !items.strings) {
        return jobsSource;
      }

      const jobs: Job[] = items.strings.map(toJob);

      return {
        ...jobsSource,
        results: jobsByDaysAgo(jobs, 7)
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
