// Arquivo: src/users/users.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './csv-user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './entities/users.entity'; // NOVO: Importar a interface User para tipagem

@Injectable()
export class UsersService {
  constructor(private usersRepo: UserRepository) {}

  async findOne(username: string) {
    return this.usersRepo.findByName(username);
  }
  async findByids(username: string[]) {
    return this.usersRepo.findByIds(username);
  }

  async create({ name, password }: CreateUserDto) {
    const exitUser = await this.usersRepo.findByName(name);
    if (exitUser) throw new ConflictException('Usario ja cadastrado');
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    const { id, name: a } = await this.usersRepo.create({
      name,
      password: hashed,
    });

    return a;
  }

  // NOVO MÉTODO: Para atualizar o status de banimento de um usuário
  async updateBanStatus(
    userId: string,
    bannedStatus: boolean,
  ): Promise<{ message: string }> {
    const user = (await this.usersRepo.findAll()).find((u) => u.id === userId); // Encontra o usuário pelo ID
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    user.banned = bannedStatus; // Atualiza o status de banimento
    await this.usersRepo.update(user); // Salva a alteração no repositório CSV
    return {
      message: `Usuário ${user.name} foi ${bannedStatus ? 'banido' : 'desbanido'} com sucesso.`,
    };
  }
}
