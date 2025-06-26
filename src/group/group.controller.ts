import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ForbiddenException,
  Response,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('group')
export class GroupController {
  constructor(private readonly groupRepo: GroupRepository) {}

  @Get('my')
  @ApiResponse({
    example: [
      {
        id: '52aef205-61ff-47a2-8692-9ed4ef2328a7',
        name: 'Jogo do bicho',
        adminsId: [
          'bb145801-dd77-4e34-bdea-bee5dd790f3e',
          '66cb214f-bedf-4830-b85e-5c02507ed9e5',
        ],
        members: [
          'bb145801-dd77-4e34-bdea-bee5dd790f3e',
          '6ee878d0-e36c-4596-a249-46f2cd948146',
          '66cb214f-bedf-4830-b85e-5c02507ed9e5',
        ],
        pendingRequests: [],
      },
      {
        id: '6141b8f9-7f9d-4d4b-901c-e59f77c7bb0d',
        name: 'Tigrio',
        adminsId: ['66cb214f-bedf-4830-b85e-5c02507ed9e5'],
        members: ['66cb214f-bedf-4830-b85e-5c02507ed9e5'],
        pendingRequests: [],
      },
    ],
  })
  async myGroups(@Request() req) {
    return await this.groupRepo.findMyGroups(req.user.id);
  }
  @Get()
  @ApiResponse({
    example: [
      {
        id: '52aef205-61ff-47a2-8692-9ed4ef2328a7',
        name: 'Jogo do bicho',
        adminsId: [
          'bb145801-dd77-4e34-bdea-bee5dd790f3e',
          '66cb214f-bedf-4830-b85e-5c02507ed9e5',
        ],
        members: [
          'bb145801-dd77-4e34-bdea-bee5dd790f3e',
          '6ee878d0-e36c-4596-a249-46f2cd948146',
          '66cb214f-bedf-4830-b85e-5c02507ed9e5',
        ],
        pendingRequests: [],
      },
      {
        id: '6141b8f9-7f9d-4d4b-901c-e59f77c7bb0d',
        name: 'Tigrio',
        adminsId: ['66cb214f-bedf-4830-b85e-5c02507ed9e5'],
        members: ['66cb214f-bedf-4830-b85e-5c02507ed9e5'],
        pendingRequests: [],
      },
    ],
  })
  async findAll(@Request() req) {
    return await this.groupRepo.findAll();
  }

  @Post('create')
  @ApiResponse({
    example: {
      id: '52aef205-61ff-47a2-8692-9ed4ef2328a7',
      name: 'Jogo do bicho',
      adminsId:
        'bb145801-dd77-4e34-bdea-bee5dd790f3e;66cb214f-bedf-4830-b85e-5c02507ed9e5',
      members:
        'bb145801-dd77-4e34-bdea-bee5dd790f3e;6ee878d0-e36c-4596-a249-46f2cd948146;66cb214f-bedf-4830-b85e-5c02507ed9e5',
    },
  })
  async create(
    @Request() req,
    @Body() { adminsId, members, name }: CreateGroupDto,
  ) {
    const { id }: { id: string } = req.user;

    if (!members) {
      members = [id];
    } else if (!members.includes(id)) {
      members = [...members, id];
    }

    if (!adminsId) {
      adminsId = [id];
    } else if (!adminsId.includes(id)) {
      adminsId = [...adminsId, id];
    }

    return await this.groupRepo.create({
      name,
      adminsId,
      members,
    });
  }

  @Patch(':id/join')
  @ApiResponse({ description: 'Pedir para entrar em um grupo' })
  async join(@Request() req, @Param('id') groupId: string) {
    const { id }: { id: string } = req.user;

    const group = await this.groupRepo.findById(groupId);

    if (!group) {
      throw new ForbiddenException('Grupo nao encontrado');
    }
    if (group.pendingRequests.includes(id)) {
      throw new ForbiddenException(
        'Este usuarios ja esta pentendes para virar membros',
      );
    }

    group.pendingRequests.push(id);

    return await this.groupRepo.update(group);
  }

  @Patch(':id/approve/:userId')
  @ApiResponse({ description: 'Aprovar um usuario' })
  async approve(
    @Request() req,
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ) {
    const { id }: { id: string } = req.user;

    const group = await this.groupRepo.findById(groupId);

    if (!group) {
      throw new ForbiddenException('Grupo nao encontrado');
    }
    if (!group.adminsId.includes(id)) {
      throw new ForbiddenException('Apenas os Admins pode aprovar membros');
    }
    if (!group.pendingRequests.includes(userId)) {
      throw new ForbiddenException(
        'Apenas os usuarios pentendes pode vira membros',
      );
    }

    group.members.push(userId);
    group.pendingRequests = group.pendingRequests.filter((g) => g !== userId);

    // this.groupRepo.approveMember(groupId, userId);
    return await this.groupRepo.update(group);
  }

  @Patch(':id/reject/:userId')
  @ApiResponse({ description: 'Rejeitar o usuario pendente' })
  async reject(
    @Request() req,
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ) {
    const { id }: { id: string } = req.user;

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new ForbiddenException('Grupo nao encontrado');
    }
    if (!group.adminsId.includes(id)) {
      throw new ForbiddenException('Apenas o admins pode rejeitar membros');
    }
    group.pendingRequests = group.pendingRequests.filter((g) => g !== userId);

    await this.groupRepo.update(group);
    return group;
  }

  @Patch(':id/ban/:userId')
  @ApiResponse({ description: 'Remove membro do grupo' })
  async ban(
    @Request() req,
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ) {
    const { id }: { id: string } = req.user;

    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new ForbiddenException('Grupo nao encontrado');
    }
    if (!group.adminsId.includes(id)) {
      throw new ForbiddenException('Apenas o admins pode banir do membros');
    }
    if (!group.members.includes(userId)) {
      throw new ForbiddenException('Usuario nao esta no grupo');
    }
    if (group.adminsId.includes(userId)) {
      group.adminsId = group.adminsId.filter((g) => g !== userId);
    }
    group.members = group.members.filter((g) => g !== userId);

    await this.groupRepo.update(group);
    return group;
  }
}
