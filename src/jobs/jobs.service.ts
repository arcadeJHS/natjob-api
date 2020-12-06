import { Injectable } from '@nestjs/common';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { TuttojobService } from './services/tuttojob/tuttojob.service';
import { JobsSource } from './models/JobsSource.interface';
import { JobsQueryString } from './models/JobsQueryString.interface';

@Injectable()
export class JobsService {

  constructor(
    private readonly corriereLavoroService: CorriereLavoroService,
    private readonly tuttojobService: TuttojobService
  ) {}

  // query different job services and aggregate a normalized response
  async findAll(query: JobsQueryString): Promise<JobsSource[]> {
    const corriereLavoroJobs = await this.corriereLavoroService.findJobs(query);
    const tuttojobJobs = await this.tuttojobService.findJobs(query);

    return [
      corriereLavoroJobs,
      tuttojobJobs
    ];
  }
}
