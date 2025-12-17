import { Module } from '@nestjs/common'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { SharedModule } from 'src/shared/shared.module'
import { ProfileRepo } from 'src/routes/profile/profile.repo'

@Module({
  imports: [SharedModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepo],
  exports: [ProfileService],
})
export class ProfileModule {}
