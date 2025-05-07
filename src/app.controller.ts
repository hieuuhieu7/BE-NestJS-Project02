import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './decorator/customize';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService
  ) { }

  // EJS - View
  // @Get()
  // @Render('home.ejs')
  // getHello() {
  //   console.log('Check PORT: ', this.configService.get<string>("PORT"));
  //   const message = this.appService.getHello();
  //   return {
  //     message: message
  //   }
  //   // return "this.appService.getHello()";
  // }
}
