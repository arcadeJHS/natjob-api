import { Injectable } from '@nestjs/common';
import { Job } from '../../interfaces/job.interface';

const normalizeJob = (data) => {
  let base = {
    source: 'Corriere Lavoro',
    sourceUrl: 'https://www.corrierelavoro.ch/',
  };
  return {...base, ...data};
};

@Injectable()
export class CorriereLavoroService {
  
  findJobs(): Job[] {
    const jobs = [];

    // loop: search into site for jobs, normalize and push into the "jobs" array
    // substitute the following placeholder code with real puppeteer scraping
    const retrievedJob: Job = normalizeJob({
      title: 'Impiegata Amministrativa 50%',
      location: 'Biasca',
      publicationDate: '2020-11-20T10:30:00.000',
      url: 'https://www.corrierelavoro.ch/jobs/12345',
    });
    
    jobs.push(retrievedJob);

    return jobs;
  }

}
