import { Controller, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './interfaces/job.interface';

// /jobs
@Controller('jobs')
export class JobsController {

  constructor(private readonly jobsService: JobsService) { }

  // /jobs
  @Get()
  findAll(): Job[] {
    return this.jobsService.findAll();
  }

}
