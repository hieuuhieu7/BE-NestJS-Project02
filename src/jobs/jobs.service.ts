import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    let createJob = await this.jobModel.create(
      {
        name: createJobDto.name,
        skills: createJobDto.skills,
        company: createJobDto.company,
        location: createJobDto.location,
        salary: createJobDto.salary,
        quantity: createJobDto.quantity,
        level: createJobDto.level,
        description: createJobDto.description,
        startDate: createJobDto.startDate,
        endDate: createJobDto.endDate,
        isActive: createJobDto.isActive,

        createdBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return createJob;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+current - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error 
      .sort(sort)
      .populate(population)
      .exec();

    return {
      meta: {
        current: current, //trang hiện tại 
        pageSize: pageSize, //số lượng bản ghi đã lấy 
        pages: totalPages,  //tổng số trang với điều kiện query 
        total: totalItems // tổng số phần tử (số bản ghi) 
      },
      result //kết quả query 
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found user';
    }

    let getJobById = await this.jobModel.findOne({ _id: id });
    return getJobById;
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    let updateJob = await this.jobModel.updateOne({ _id: id },
      {
        ...updateJobDto,

        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return updateJob;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found user';
    }

    await this.jobModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    let deleteJob = await this.jobModel.softDelete({ _id: id });
    return deleteJob;
  }
}
