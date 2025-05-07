import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  @Post()
  @ResponseMessage('Create Role Success!')
  async create(@Body() createRoleDto: CreateRoleDto, @User() user: IUser) {
    let createRole = await this.rolesService.create(createRoleDto, user);
    return {
      _id: createRole?._id,
      createdAt: createRole?.createdAt
    }
  }

  @Get()
  @Public()
  @ResponseMessage('Get Role With Page!')
  findAll(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string,
  ) {
    return this.rolesService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get Role By ID!')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update Role Success!')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @User() user: IUser) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete Role Success!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.rolesService.remove(id, user);
  }
}
