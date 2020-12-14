import { Injectable } from '@nestjs/common';
import { JobsSource } from './models/JobsSource.interface';
import { JobsQueryString } from './models/JobsQueryString.interface';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { TuttojobService } from './services/tuttojob/tuttojob.service';
import { CarrieraChService } from './services/carriera-ch/carriera-ch.service';
import { JobRoomService } from './services/job-room/job-room.service';

@Injectable()
export class JobsService {

  constructor(
    private readonly corriereLavoroService: CorriereLavoroService,
    private readonly tuttojobService: TuttojobService,
    private readonly carrieraChService: CarrieraChService,
    private readonly jobRoomService: JobRoomService
  ) {}

  // query different job services and aggregate a normalized response
  async findAll(query: JobsQueryString): Promise<JobsSource[]> {
    const corriereLavoroJobs = await this.corriereLavoroService.findJobs(query);
    const tuttojobJobs = await this.tuttojobService.findJobs(query);
    const carrieraChJobs = await this.carrieraChService.findJobs(query);
    const jobRoomJobs = await this.jobRoomService.findJobs(query);

    return [
      corriereLavoroJobs,
      tuttojobJobs,
      carrieraChJobs,
      jobRoomJobs
    ];
  }
}
