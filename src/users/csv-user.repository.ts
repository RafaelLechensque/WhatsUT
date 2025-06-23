import { Injectable } from '@nestjs/common';
import { User } from './users.entity';
import * as fs from 'fs';
import * as path from 'path';
import { parse, writeToStream } from 'fast-csv';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 } from 'uuid';

const CSV_FILE = path.resolve(__dirname, '../../data/users.csv');
const CSV_HEADERS = 'id,name,password\n';

export async function ensureCsvFileExists() {
  try {
    await fs.promises.access(CSV_FILE);
  } catch {
    await fs.promises.mkdir(path.dirname(CSV_FILE), { recursive: true });
    await fs.promises.writeFile(CSV_FILE, CSV_HEADERS);
  }
}

@Injectable()
export class UserRepository {
  async findAll(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const users: User[] = [];
      fs.createReadStream(CSV_FILE)
        .pipe(parse({ headers: true }))
        .on('error', reject)
        .on('data', (row) => users.push(row))
        .on('end', () => resolve(users));
    });
  }

  async findByName(name: string): Promise<User | undefined> {
    const users = (await this.findAll()).find((user) => user.name === name);
    return users;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user: User = {
      id: v4(),
      name: dto.name,
      password: dto.password,
    };

    const row = [user];

    await new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(CSV_FILE, { flags: 'a' });
      writeToStream(writableStream, row, { headers: false })
        .on('error', reject)
        .on('finish', () => resolve(undefined));
    });

    return user;
  }
}
