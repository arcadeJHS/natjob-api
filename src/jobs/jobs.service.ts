import { Injectable } from '@nestjs/common';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { JobsSource } from './models/JobsSource.interface';
import { JobsQueryString } from './models/JobsQueryString.interface';

@Injectable()
export class JobsService {

  constructor(
    private readonly corriereLavoroService: CorriereLavoroService
  ) {}

  // query different job services and aggregate a normalized response
  async findAll(query: JobsQueryString): Promise<JobsSource[]> {
    const corriereLavoroJobs = await this.corriereLavoroService.findJobs(query);

    return [
      corriereLavoroJobs
    ];
  }
}
