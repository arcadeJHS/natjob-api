import { Injectable, Logger } from '@nestjs/common';
import { Job } from '../../interfaces/job.interface';
import * as puppeteer from 'puppeteer';

const source = 'Corriere Lavoro';
const sourceUrl = 'https://bancadati.corrierelavoro.ch/job/searchJobs.php?height=340&language=it&color1=333&color2=f1f1f1&textcolor=000000&country=214&region=3115&address=Bellinzona&latitude=46.1920538&longitude=9.0205888&max_distance=50&widgetversion=horizontal&searchType=0&hideCompanyFilter=1';

const normalizeJob = (data) => {
  return { ...{ source, sourceUrl }, ...data};
};

@Injectable()
export class CorriereLavoroService {

  private readonly logger = new Logger(CorriereLavoroService.name);
  
  async findJobs(): Promise<Job[]> {
    try {
      this.logger.log('- 1 -');

      const browser = await puppeteer.launch({args: ['--no-sandbox --disable-setuid-sandbox']});
      this.logger.log('- 2 -');

      const page = await browser.newPage();
      this.logger.log('- 3 -');

      await page.goto(sourceUrl);
      this.logger.log('- 4 -');

      // await page.waitForSelector('#searchInput', {visible: true});
      await page.waitForSelector('input[name="cand_search-job_city"]', { visible: true });
      this.logger.log('- 5 -');
    
      // await page.type('#searchInput', 'impiegato');
      await page.type('input[name="cand_search-job_city"]', 'Bellinzona');
      this.logger.log('- 6 -');

      await page.click('#submit');
      this.logger.log('- 7 -');
    
      // await page.waitForNavigation({ timeout: 0, waitUntil: "networkidle0" });
      // await page.waitForSelector('.searchResults', { visible: true });
    
      const ajaxSearchResponse = await page.waitForResponse('https://bancadati.corrierelavoro.ch/ajax/common/ajax_search.php');
      this.logger.log('- 8 -');

      const results = await ajaxSearchResponse.json();
      this.logger.log('- 9 -');

      /*
      const results2 = await page.$$eval(".singleResult", nodes => {
        return nodes.map(node => {
          const h3 = node.querySelector('h3');
          return h3.textContent;
        });
      });
      */
    
      await browser.close();
      this.logger.log('- 10 -');

      if (!results || !results.strings) { return []; }

      return results.strings.map((r) => {
        return normalizeJob({
          title: r.adName,
          location: r.city,
          publicationDate: r.date,
          url: r.adId,
          originalSource: r.empName,
          description: r.desc
        });
      });
    }
    catch (e) { 
      this.logger.log('- ERROR -');
      this.logger.log(e);
      return e;
    }
  }

}
