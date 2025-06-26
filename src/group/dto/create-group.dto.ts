import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    example: 'Jogo do bicho',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: ['bb145801-dd77-4e34-bdea-bee5dd790f3e'],
  })
  adminsId: string[];

  @ApiProperty({
    example: [
      'bb145801-dd77-4e34-bdea-bee5dd790f3e',
      '6ee878d0-e36c-4596-a249-46f2cd948146',
    ],
  })
  members: string[];
}
