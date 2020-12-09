import { Controller, Get, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsSource } from './models/JobsSource.interface';
import { JobsQueryString } from './models/JobsQueryString.interface';
import { defaultQueryString } from './models/DefaultQueryString';

// /jobs
@Controller('jobs')
export class JobsController {

  constructor(private readonly jobsService: JobsService) { }

  // /jobs
  @Get()
  async findAll(@Query() query: JobsQueryString): Promise<JobsSource[]> {
    query = { ...defaultQueryString, ...query };
    const jobs: JobsSource[] = await this.jobsService.findAll(query);
    return jobs;
  }

}
