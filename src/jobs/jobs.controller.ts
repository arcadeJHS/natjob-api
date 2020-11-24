import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './interfaces/job.interface';

// /jobs
@Controller('jobs')
export class JobsController {

  constructor(private readonly jobsService: JobsService) { }

  // /jobs
  @Get()
  async findAll(): Promise<Job[]> {
    try {
      const jobs = await this.jobsService.findAll();
      return jobs;
    }
    catch (e) { 
      return e;
    }
  }

}
