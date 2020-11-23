import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { CorriereLavoroService } from './services/corriere-lavoro/corriere-lavoro.service';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    CorriereLavoroService
  ]
})
export class JobsModule {}
