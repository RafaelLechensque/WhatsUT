import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ChatRepository } from './chat.repository';
import { MessageDto } from './dto/create-message';

@Controller('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatRepo: ChatRepository) {}

  @Get('private/:userId')
  async getPrivateMessages(@Request() req, @Param('userId') otherId: string) {
    return this.chatRepo.findPrivateChat(req.user.id, otherId);
  }
  @Get('group/:groupId')
  async getGroupMessages(@Request() req, @Param('groupId') otherId: string) {
    return this.chatRepo.findGroupChat(otherId);
  }

  @Post('private/:userId')
  async sendoPrivate(
    @Request() req,
    @Param('userId') userId: string,
    @Body() { menssagem }: MessageDto,
  ) {
    const id: string = req.user.id;
    return await this.chatRepo.send({
      chatType: 'private',
      content: menssagem,
      senderId: id,
      targetId: userId,
    });
  }
  @Post('group/:groupId')
  async sendoGroup(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() { menssagem }: MessageDto,
  ) {
    const id: string = req.user.id;
    return await this.chatRepo.send({
      chatType: 'group',
      content: menssagem,
      senderId: id,
      targetId: groupId,
    });
  }

  // @Post()
  // create(@Body() createChatDto: CreateChatDto) {
  //   return this.chatService.create(createChatDto);
  // }

  // @Get()
  // findAll() {
  //   return this.chatService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.chatService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.chatService.remove(+id);
  // }
}
