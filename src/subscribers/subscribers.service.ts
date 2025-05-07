import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { use } from 'passport';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    let checkEmail = await this.subscriberModel.findOne({ email: createSubscriberDto.email });
    if (checkEmail) {
      throw new BadRequestException(`Name: ${createSubscriberDto.email} đã tồn tại!`);
    }

    let createSub = await this.subscriberModel.create({
      name: createSubscriberDto.name,
      email: createSubscriberDto.email,
      skills: createSubscriberDto.skills,

      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return createSub;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+current - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel.find(filter)
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
      return 'Not found ID!';
    }

    let getSubById = await this.subscriberModel.findOne({ _id: id });

    return getSubById;
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    let updateSub = await this.subscriberModel.updateOne({ email: user.email },
      {
        ...updateSubscriberDto,

        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      {
        upsert: true
      }
    )
    return updateSub;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found ID!';
    }

    let deleteSub = await this.subscriberModel.softDelete({ _id: id });

    return deleteSub;
  }

  async getSkills(user: IUser) {
    const { email } = user;
    return await this.subscriberModel.findOne({ email }, { skills: 1 })
  }
}
