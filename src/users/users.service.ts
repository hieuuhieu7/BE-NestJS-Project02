import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs'
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { use } from 'passport';
import aqp from 'api-query-params';
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,

  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  // Register User
  async register(registerUserDto: RegisterUserDto) {
    const checkEmail = await this.userModel.findOne({ email: registerUserDto.email });
    if (checkEmail) {
      throw new BadRequestException(`Email: ${registerUserDto.email} đã tồn tại!`);
    }

    //fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashPassword = this.getHashPassword(registerUserDto.password);
    let register = await this.userModel.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: hashPassword,
      age: registerUserDto.age,
      gender: registerUserDto.gender,
      address: registerUserDto.address,
      role: userRole?._id
    })
    return register;
  }

  // Create user
  async create(createUserDto: CreateUserDto, user: IUser) {
    const checkEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (checkEmail) {
      throw new BadRequestException(`Email: ${createUserDto.email} đã tồn tại!`);
    }
    const hashPassword = this.getHashPassword(createUserDto.password);
    let createUser = await this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashPassword,
      age: createUserDto.age,
      gender: createUserDto.gender,
      address: createUserDto.address,
      role: createUserDto.role,
      company: createUserDto.company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return createUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter).select("-password")
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error 
      .sort(sort)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại 
        pageSize: limit, //số lượng bản ghi đã lấy 
        pages: totalPages,  //tổng số trang với điều kiện query 
        total: totalItems // tổng số phần tử (số bản ghi) 
      },
      result //kết quả query 
    }
  }

  // Get user by id
  async findOne(id: string) {
    // Kiểm tra ID có hợp lệ không
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    let getUserById = await this.userModel.findOne({ _id: id }).select("-password").populate({ path: 'role', select: { name: 1, _id: 1 } });

    // Nếu không tìm thấy user
    if (!getUserById) {
      throw new NotFoundException('User not found');
    }

    return getUserById;
  }

  // Login
  async findOneByUsername(username: string) {
    // let email = await this.userModel.findOne({ email: username }).populate({ path: 'role', select: { name: 1, permissions: 1 } })
    let email = await this.userModel.findOne({ email: username }).populate({ path: 'role', select: { name: 1 } })
    return email;
  }

  // Check Password
  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  // Update user
  async update(updateUserDto: UpdateUserDto) {
    let updateUser = await this.userModel.updateOne({ _id: updateUserDto._id },
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        age: updateUserDto.age,
        gender: updateUserDto.gender,
        address: updateUserDto.address,
        role: updateUserDto.role,
        company: updateUserDto.company,
        updatedBy: {
          _id: updateUserDto._id,
          email: updateUserDto.email
        }
      }
    )
    return updateUser;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found user';
    }

    const checkAdmin = await this.userModel.findOne({ _id: id });
    if (checkAdmin && checkAdmin.email === "admin@gmail.com") {
      throw new BadRequestException('Không thể xóa tài khoản ADMIN!');
    }

    await this.userModel.updateOne({ _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    let deleteUser = await this.userModel.softDelete({ _id: id })
    return deleteUser;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id },
      {
        refreshToken
      }
    )
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({ path: 'role', select: { name: 1 } })
  }
}

