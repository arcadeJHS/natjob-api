import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Job } from '../../interfaces/Job.interface';
import { JobsSource } from '../../interfaces/JobsSource.interface';
import { jobsByDaysAgo } from '../../utillities/jobsByDaysAgo.filter';

const jobsSource: JobsSource = {
  name: 'Corriere Lavoro',
  url: 'https://bancadati.corrierelavoro.ch',
  results: []
};

const searchStartUrl = 'https://bancadati.corrierelavoro.ch/job/searchJobs.php?height=340&language=it&color1=333&color2=f1f1f1&textcolor=000000&country=214&region=3115&address=Bellinzona&latitude=46.1920538&longitude=9.0205888&max_distance=50&widgetversion=horizontal&searchType=0&hideCompanyFilter=1';

const toJob = (item) => {
  return {
    title: item.adName,
    location: item.city,
    publicationDate: `${item.date.slice(-4)}-${item.date.slice(3,5)}-${item.date.slice(0,2)}`,
    url: item.adId.replace('..', jobsSource.url),
    originalSource: item.empName,
    originalSourceJobs: `${jobsSource.url}${item.empPage}`,
    description: item.desc
  };
};

@Injectable()
export class CorriereLavoroService {

  private readonly logger = new Logger(CorriereLavoroService.name);
  
  async findJobs(): Promise<JobsSource> {
    try {
      if (!puppeteer) { 
        throw new Error('Puppeteer not available!');
      }

      const browser = await puppeteer.launch({
        dumpio: true,
        args: ['--no-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(searchStartUrl);
      await page.waitForSelector('input[name="cand_search-job_city"]', { visible: true });
      await page.type('input[name="cand_search-job_city"]', 'Bellinzona');
      await page.click('#submit');
    
      const ajaxSearchResponse = await page.waitForResponse('https://bancadati.corrierelavoro.ch/ajax/common/ajax_search.php');
      const items = await ajaxSearchResponse.json();
    
      await browser.close();

      if (!items || !items.strings) {
        return jobsSource;
      }

      const jobs: Job[] = items.strings.map(i => toJob(i));

      return {
        ...jobsSource,
        results: jobsByDaysAgo(jobs, 7)
      };
    }
    catch (e) {
      this.logger.log(e);
      return e;
    }
  }

}
