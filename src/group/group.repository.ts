import { Injectable } from '@nestjs/common';
import { Group } from './entities/group.entity';
import { v4 } from 'uuid';
import { parse, writeToPath, writeToStream } from 'fast-csv';
import * as fs from 'fs';
import * as path from 'path';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

export const CSV_FILE_GROUP = path.resolve(__dirname, '../../data/groups.csv');
export const CSV_HEADERS_GROUP = 'id,name,adminsId,members,pendingRequests\n';

@Injectable()
export class GroupRepository {
  async findAll(): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      const groups: Group[] = [];

      fs.createReadStream(CSV_FILE_GROUP)
        .pipe(parse({ headers: true }))
        .on('error', reject)
        .on('data', (row) => {
          const group: Group = {
            id: row.id,
            name: row.name,
            adminsId: row.adminsId ? row.adminsId.split(';') : [],
            members: row.members ? row.members.split(';') : [],
            pendingRequests: row.pendingRequests
              ? row.pendingRequests.split(';')
              : [],
          };

          groups.push(group);
        })
        .on('end', () => resolve(groups));
    });
  }
  async findMyGroups(userId: string): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      const groups: Group[] = [];

      fs.createReadStream(CSV_FILE_GROUP)
        .pipe(parse({ headers: true }))
        .on('error', reject)
        .on('data', (row) => {
          const group: Group = {
            id: row.id,
            name: row.name,
            adminsId: row.adminsId ? row.adminsId.split(';') : [],
            members: row.members ? row.members.split(';') : [],
            pendingRequests: row.pendingRequests
              ? row.pendingRequests.split(';')
              : [],
          };

          if (group.members.includes(userId)) {
            groups.push(group);
          }
        })
        .on('end', () => resolve(groups));
    });
  }

  async update(updatedGroup: Group): Promise<Group[]> {
    const groups: Group[] = [];

    // Passo 1: Lê todos os grupos
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(CSV_FILE_GROUP)
        .pipe(parse({ headers: true }))
        .on('error', reject)
        .on('data', (row) => {
          const group: Group = {
            id: row.id,
            name: row.name,
            adminsId: row.adminsId ? row.adminsId.split(';') : [],
            members: row.members ? row.members.split(';') : [],
            pendingRequests: row.pendingRequests
              ? row.pendingRequests.split(';')
              : [],
          };

          // Substitui se for o grupo atualizado
          if (group.id === updatedGroup.id) {
            groups.push(updatedGroup);
          } else {
            groups.push(group);
          }
        })
        .on('end', resolve);
    });

    // Passo 2: Reescreve todo o arquivo
    const rows = groups.map((g) => ({
      id: g.id,
      name: g.name,
      adminsId: g.adminsId.join(';'),
      members: g.members.join(';'),
      pendingRequests: g.pendingRequests.join(';'),
    }));

    await new Promise<void>((resolve, reject) => {
      writeToPath(CSV_FILE_GROUP, rows, { headers: true })
        .on('error', reject)
        .on('finish', resolve);
    });

    return groups;
  }

  async create({ adminsId, members, name }: CreateGroupDto) {
    const group = {
      id: v4(),
      name,
      adminsId: adminsId?.join(';'),
      members: members?.join(';'),
      // pendingRequests: '',
    };

    const row = [group];

    await new Promise((resolve, reject) => {
      const writableStream = fs.createWriteStream(CSV_FILE_GROUP, {
        flags: 'a',
      });
      writeToStream(writableStream, row, {
        headers: false,
        includeEndRowDelimiter: true,
      })
        .on('error', reject)
        .on('finish', () => resolve(undefined));
    });
    return group;
  }

  findById(id: string): Promise<Group | undefined> {
    return new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_GROUP)
        .pipe(parse({ headers: true }))
        .on('error', reject)
        .on('data', (row) => {
          if (row.id === id) {
            const group: Group = {
              id: row.id,
              name: row.name,
              adminsId: row.adminsId ? row.adminsId.split(';') : [],
              members: row.members ? row.members.split(';') : [],
              pendingRequests: row.pendingRequests
                ? row.pendingRequests.split(';')
                : [],
            };
            resolve(group);
          }
        })
        .on('end', () => resolve(undefined));
    });
  }

  // requestToJoin(groupId: string, userId: string) {
  //   const group = this.findById(groupId);
  //   if (group && !group.pendingRequests.includes(userId)) {
  //     group.pendingRequests.push(userId);
  //   }
  // }

  // async approveMember(groupId: string, userId: string) {
  //   const group = await this.findById()
  //   if (group) {
  //     group.members.push(userId);
  //     group.pendingRequests = group.pendingRequests.filter(
  //       (id) => id !== userId,
  //     );
  //   }
  // }

  // rejectMember(groupId: string, userId: string) {
  //   const group = this.findById(groupId);
  //   if (group) {
  //     group.pendingRequests = group.pendingRequests.filter(
  //       (id) => id !== userId,
  //     );
  //   }
  // }
}
