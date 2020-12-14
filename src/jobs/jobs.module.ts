import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { TuttojobService } from './services/tuttojob/tuttojob.service';
import { CarrieraChService } from './services/carriera-ch/carriera-ch.service';
import { JobRoomService } from './services/job-room/job-room.service';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    CorriereLavoroService,
    TuttojobService,
    CarrieraChService,
    JobRoomService
  ]
})
export class JobsModule {}
