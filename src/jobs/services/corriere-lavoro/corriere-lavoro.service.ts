import { Injectable, Logger } from '@nestjs/common';
import { Job } from '../../interfaces/Job.interface';
import { JobsSource } from '../../interfaces/JobsSource.interface';
import * as puppeteer from 'puppeteer';

const source = 'Corriere Lavoro';
const sourceUrl = 'https://bancadati.corrierelavoro.ch';
const searchStartUrl = 'https://bancadati.corrierelavoro.ch/job/searchJobs.php?height=340&language=it&color1=333&color2=f1f1f1&textcolor=000000&country=214&region=3115&address=Bellinzona&latitude=46.1920538&longitude=9.0205888&max_distance=50&widgetversion=horizontal&searchType=0&hideCompanyFilter=1';

const filterJobsByDate = (jobs: Job[]): Job[] => { 
  const daysAgo = 7;
  return jobs.filter(j => (new Date().getDate() - new Date(j.publicationDate).getDate()) <= daysAgo );
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

      // await page.waitForSelector('#searchInput', {visible: true});
      await page.waitForSelector('input[name="cand_search-job_city"]', { visible: true });
    
      // await page.type('#searchInput', 'impiegato');
      await page.type('input[name="cand_search-job_city"]', 'Bellinzona');

      await page.click('#submit');
    
      // await page.waitForNavigation({ timeout: 0, waitUntil: "networkidle0" });
      // await page.waitForSelector('.searchResults', { visible: true });
    
      const ajaxSearchResponse = await page.waitForResponse('https://bancadati.corrierelavoro.ch/ajax/common/ajax_search.php');

      const items = await ajaxSearchResponse.json();

      /*
      const results2 = await page.$$eval(".singleResult", nodes => {
        return nodes.map(node => {
          const h3 = node.querySelector('h3');
          return h3.textContent;
        });
      });
      */
    
      await browser.close();

      let results;

      if (!items || !items.strings) { results = []; }

      results = items.strings.map((r) => {
        return {
          title: r.adName,
          location: r.city,
          publicationDate: `${r.date.slice(-4)}-${r.date.slice(3,5)}-${r.date.slice(0,2)}`,
          url: r.adId.replace('..', sourceUrl),
          originalSource: r.empName,
          originalSourceJobs: `${sourceUrl}${r.empPage}`,
          description: r.desc
        };
      });

      return {
        name: source,
        url: sourceUrl,
        results: filterJobsByDate(results)
      };
    }
    catch (e) { 
      this.logger.log('- ERROR -');
      this.logger.log(e);
      return e;
    }
  }

}
