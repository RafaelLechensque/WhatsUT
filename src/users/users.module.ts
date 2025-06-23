import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './csv-user.repository';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
  controllers: [UsersController],
})
export class UsersModule {}
