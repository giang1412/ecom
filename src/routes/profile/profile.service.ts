import { Injectable } from '@nestjs/common'
import { ChangePasswordBodyType, UpdateMeBodyType } from 'src/routes/profile/profile.model'
import { ProfileRepo } from 'src/routes/profile/profile.repo'
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/error'
import { isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
      id: userId,
      deletedAt: null,
    })

    if (!user) {
      throw NotFoundRecordException
    }

    return user
  }

  async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
    try {
      return await this.sharedUserRepository.update(
        { id: userId },
        {
          ...body,
          updatedById: userId,
        },
      )
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
  async changePassword({ userId, body }: { userId: number; body: Omit<ChangePasswordBodyType, 'confirmNewPassword'> }) {
    try {
      const { password, newPassword } = body
      const user = await this.sharedUserRepository.findUnique({
        id: userId,
        deletedAt: null,
      })
      if (!user) {
        throw NotFoundRecordException
      }
      const isPasswordMatch = await this.hashingService.compare(password, user.password)
      if (!isPasswordMatch) {
        throw InvalidPasswordException
      }
      const hashedPassword = await this.hashingService.hash(newPassword)

      await this.sharedUserRepository.update(
        { id: userId },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      )
      return {
        message: 'Password changed successfully',
      }
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
