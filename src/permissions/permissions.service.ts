import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from './schemas/permission.entity';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    let createPermission = await this.permissionModel.create(
      {
        name: createPermissionDto.name,
        apiPath: createPermissionDto.apiPath,
        method: createPermissionDto.method,
        module: createPermissionDto.module,

        createdBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return createPermission;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+current - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error 
      .sort(sort)
      .populate(population)
      .select(projection as any)
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

    let getPermissionById = await this.permissionModel.findOne({ _id: id })
    return getPermissionById;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    let updatePermission = await this.permissionModel.updateOne({ _id: id },
      {
        ...updatePermissionDto,

        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return updatePermission;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found user';
    }

    await this.permissionModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )

    let deletePermission = await this.permissionModel.softDelete({ _id: id });
    return deletePermission;
  }
}
