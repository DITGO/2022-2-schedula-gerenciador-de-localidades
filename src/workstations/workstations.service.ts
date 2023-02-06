import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CitiesService } from '../../src/cities/cities.service';
import { Repository } from 'typeorm';
import { CreateWorkstationDto } from './dto/create-workstation.dto';
import { UpdateWorkstationDto } from './dto/update-workstation.dto';
import { Workstation } from './entities/workstation.entity';
import { DeleteWorkstationDto } from './dto/delete-workstation.dto';

@Injectable()
export class WorkstationsService {
  constructor(
    @InjectRepository(Workstation)
    private workRepo: Repository<Workstation>,
    private citiesService: CitiesService,
  ) {}

  async updateChilds(child_workstation_ids: string[]): Promise<Workstation[]> {
    const child_workstations: Workstation[] = [];
    for (const i in child_workstation_ids) {
      const res = await this.workRepo.findOneBy({
        id: child_workstation_ids[i],
      });
      child_workstations.push(res);
    }
    return child_workstations;
  }

  async createWorkstation(
    createWorkstationDto: CreateWorkstationDto,
  ): Promise<Workstation> {
    try {
      const { parent_workstation_id, city_id, child_workstation_ids } =
        createWorkstationDto;
      const city = await this.citiesService.findCityById(city_id);
      const parent_workstation = parent_workstation_id
        ? await this.findWorkstation(parent_workstation_id)
        : null;
      const child_workstations: Workstation[] = child_workstation_ids
        ? await this.updateChilds(child_workstation_ids)
        : [];

      const work = this.workRepo.create({
        ...createWorkstationDto,
        city,
        parent_workstation,
        child_workstations,
      });
      await this.workRepo.save(work);
      return work;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findAll() {
    try {
      const res = await this.workRepo.find({
        relations: ['city', 'parent_workstation', 'child_workstations'],
      });
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findWorkstation(id: string): Promise<Workstation> {
    try {
      const res = await this.workRepo.findOne({
        where: { id },
        relations: ['parent_workstation', 'child_workstations'],
      });
      if (!res) throw new NotFoundException('Posto de trabalho não encontrado');
      return res;
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async updateWorkstation(
    id: string,
    updateWorkstationDto: UpdateWorkstationDto,
  ): Promise<Workstation> {
    try {
      const { parent_workstation_id, city_id, child_workstation_ids } =
        updateWorkstationDto;

      const workstation = await this.workRepo.findOneBy({ id });
      const city = city_id
        ? await this.citiesService.findCityById(city_id)
        : workstation.city;
      const parent_workstation = parent_workstation_id
        ? await this.findWorkstation(parent_workstation_id)
        : workstation.parent_workstation;
      const child_workstations: Workstation[] = child_workstation_ids
        ? await this.updateChilds(child_workstation_ids)
        : [];

      await this.workRepo.save({
        id,
        ...updateWorkstationDto,
        city,
        parent_workstation,
        child_workstations,
      });

      return await this.workRepo.findOneBy({ id });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteWorkstation(
    id: string,
    realoc: DeleteWorkstationDto,
  ): Promise<string> {
    const res = await this.workRepo.findOneBy({ id });
    if (!res) {
      throw new NotFoundException('Posto de trabalho não encontrado');
    }
    try {
      if (realoc?.data || (realoc?.data && realoc?.data.length > 0)) {
        for (const reallocation of realoc.data) {
          const destineWorkstation = await this.workRepo.findOne({
            where: { id: reallocation.destinationId },
            relations: {
              city: true,
              parent_workstation: true,
              child_workstations: true,
            },
          });
          const childWorkstation = await this.workRepo.findOneBy({
            id: reallocation.reallocatedId,
          });
          childWorkstation.parent_workstation = destineWorkstation;
          await this.workRepo.save(childWorkstation);
          destineWorkstation.child_workstations.push(childWorkstation);
          await this.workRepo.save(destineWorkstation);
        }
      }

      await this.workRepo.delete({ id });

      return 'Deletado com sucesso';
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
