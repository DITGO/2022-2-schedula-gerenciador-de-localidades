import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { WorkstationsService } from './workstations.service';
import { CreateWorkstationDto } from './dto/create-workstation.dto';
import { UpdateWorkstationDto } from './dto/update-workstation.dto';
import { Workstation } from './entities/workstation.entity';
import { DeleteWorkstationDto } from './dto/delete-workstation.dto';

@Controller('workstations')
@UseInterceptors(CacheInterceptor)
export class WorkstationsController {
  constructor(private readonly workService: WorkstationsService) {}

  @Post()
  async createWork(
    @Body() createWorkstationDto: CreateWorkstationDto,
  ): Promise<Workstation> {
    return await this.workService.createWorkstation(createWorkstationDto);
  }

  @Get()
  async findAll(): Promise<Workstation[]> {
    return await this.workService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Workstation> {
    return await this.workService.findWorkstation(id);
  }

  @Put(':id')
  async updateWork(
    @Param('id') id: string,
    @Body() updateWorkstationDto: UpdateWorkstationDto,
  ): Promise<Workstation> {
    return await this.workService.updateWorkstation(id, updateWorkstationDto);
  }

  @Post(':id')
  async deleteWorksta(
    @Param('id') id: string,
    @Body() deleteWorkstationDto: DeleteWorkstationDto,
  ): Promise<string> {
    return await this.workService.deleteWorkstation(id, deleteWorkstationDto);
  }
}
