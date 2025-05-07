import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {

    let checkName = await this.roleModel.findOne({ name: createRoleDto.name })
    if (checkName) {
      throw new BadRequestException(`Name: ${createRoleDto.name} đã tồn tại!`);
    }

    let createRole = await this.roleModel.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      isActive: createRoleDto.isActive,
      permissions: createRoleDto.permissions,

      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return createRole;
  }

  async findAll(current: number, pageSize: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+current - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel.find(filter)
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
      throw new BadRequestException("not found role")
    }

    let getRoleById = await this.roleModel.findById(id).populate({
      path: "permissions",
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
    });

    return getRoleById;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    // let checkName = await this.roleModel.findOne({ name: updateRoleDto.name })
    // if (checkName) {
    //   throw new BadRequestException(`Name: ${updateRoleDto.name} đã tồn tại!`);
    // }

    let updateRole = await this.roleModel.updateOne({ _id: id },
      {
        ...updateRoleDto,

        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return updateRole;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found user';
    }

    const checkAdmin = await this.roleModel.findOne({ _id: id });
    if (checkAdmin.name === ADMIN_ROLE) {
      throw new BadRequestException('Không thể xóa role ADMIN!');
    }

    await this.roleModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )

    let deleteRole = await this.roleModel.softDelete({ _id: id });

    return deleteRole;
  }
}
