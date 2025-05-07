import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage('Create Resume Success!')
  async create(@Body() createResumeDto: CreateResumeDto, @User() user: IUser) {
    let createResume = await this.resumesService.create(createResumeDto, user);
    return {
      _id: createResume?._id,
      createdAt: createResume?.createdAt
    }
  }

  @Get()
  @Public()
  @ResponseMessage('Get Resume With Page!')
  findAll(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+current, +pageSize, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get Resume By ID!')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update Resume Success!')
  async update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto, @User() user: IUser) {
    return this.resumesService.update(id, updateResumeDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete Resume Success!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }

  // Xem danh sách CV của chính mình
  @Post('by-user')
  @ResponseMessage('CV mine')
  getCV(@User() user: IUser) {
    return this.resumesService.getCVService(user)
  }
}
