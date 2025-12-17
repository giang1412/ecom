import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class ProfileRepo {
  constructor(private prismaService: PrismaService) {}
  async me(id: number) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    })
  }
}
