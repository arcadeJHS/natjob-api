/** 
 * Aggregates different job services to respond as a unified and normalized way to the jobs controller
 */
import { Injectable } from '@nestjs/common';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { Job } from './interfaces/job.interface';

@Injectable()
export class JobsService {

  constructor(
    private readonly corriereLavoroService: CorriereLavoroService
  ) {}

  findAll(): Job[] {
    const corriereLavoroJobs = this.corriereLavoroService.findJobs();

    return [
      ...corriereLavoroJobs
    ];
  }
}
