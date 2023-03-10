import { Module } from '@nestjs/common';
import { WorkstationsService } from './workstations.service';
import { WorkstationsController } from './workstations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workstation } from './entities/workstation.entity';
import { City } from '../cities/city.entity';
import { CitiesService } from '../cities/cities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workstation, City])],
  controllers: [WorkstationsController],
  providers: [WorkstationsService, CitiesService],
})
export class WorkstationsModule {}
