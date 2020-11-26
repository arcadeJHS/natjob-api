import { Injectable } from '@nestjs/common';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { JobsSource } from './interfaces/JobsSource.interface';

@Injectable()
export class JobsService {

  constructor(
    private readonly corriereLavoroService: CorriereLavoroService
  ) {}

  // query different job services and aggregate a normalized response
  async findAll(): Promise<JobsSource[]> {
    const corriereLavoroJobs = await this.corriereLavoroService.findJobs();

    return [
      corriereLavoroJobs
    ];
  }
}
