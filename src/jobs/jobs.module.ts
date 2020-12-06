import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';
import { TuttojobService } from './services/tuttojob/tuttojob.service';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    CorriereLavoroService,
    TuttojobService
  ]
})
export class JobsModule {}
