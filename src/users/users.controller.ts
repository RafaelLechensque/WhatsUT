import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRepository } from './csv-user.repository';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userRepo: UserRepository) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const allUsers = await this.userRepo.findAll();

    const sanitizedUsers = allUsers.map((user) => {
      const isCurrentUser = user.id === req.user.id;
      return {
        id: user.id,
        name: user.name,
        isCurrentUser,
      };
    });

    return sanitizedUsers;
  }
}
