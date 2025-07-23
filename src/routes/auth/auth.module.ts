import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from 'src/routes/auth/roles.service'
import { AuthRepository } from 'src/routes/auth/auth.repo'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository],
})
export class AuthModule {}
