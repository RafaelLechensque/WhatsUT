import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from './csv-user.repository';

@Module({
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
