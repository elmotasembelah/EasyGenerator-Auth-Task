import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtGuard } from '../../common/security/guards/jwt.guard';
import { MeDocs } from './docs/me.docs';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  @Get('me')
  @UseGuards(JwtGuard)
  @MeDocs()
  me(@Req() req: Request) {
    return { id: req.user.sub, name: req.user.name, email: req.user.email };
  }
}
