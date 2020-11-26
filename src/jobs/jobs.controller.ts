import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsSource } from './interfaces/JobsSource.interface';

// /jobs
@Controller('jobs')
export class JobsController {

  constructor(private readonly jobsService: JobsService) { }

  // /jobs
  @Get()
  async findAll(): Promise<JobsSource[]> {
    try {
      const jobs = await this.jobsService.findAll();
      return jobs;
    }
    catch (e) { 
      return e;
    }
  }

}
