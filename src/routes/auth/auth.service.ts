import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from 'src/routes/auth/auth.model'
import { AuthRepository } from 'src/routes/auth/auth.repo'
import { RolesService } from 'src/routes/auth/roles.service'
import envConfig from 'src/shared/config'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import ms from 'ms'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
import { AccessTokenPayloadCreate } from 'src/shared/types/jwt.type'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  InvalidOTPException,
  InvalidPasswordException,
  InvalidTOTPAndCodeException,
  InvalidTOTPException,
  OTPExpiredException,
  RefreshTokenAlreadyUsedException,
  TOTPAlreadyEnabledException,
  TOTPNotEnabledException,
} from 'src/routes/auth/error.model'
import { TwoFactorService } from 'src/shared/services/2fa.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly tokenService: TokenService,
    private readonly twoFactorService: TwoFactorService,
  ) {}
  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const vevificationCode = await this.authRepository.findUniqueVerificationCode({
      email_type: {
        email,
        type,
      },
    })
    if (!vevificationCode) {
      throw InvalidOTPException
    }
    if (vevificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }
    return vevificationCode
  }
  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })
      const clientRoleId = await this.rolesService.getClientRoleId()
      const hashedPassword = await this.hashingService.hash(body.password)

      const [user] = await Promise.all([
        await this.authRepository.createUser({
          email: body.email,
          name: body.name,
          phoneNumber: body.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_type: {
            email: body.email,
            code: body.code,
            type: TypeOfVerificationCode.REGISTER,
          },
        }),
      ])
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }
  async sendOTP(body: SendOTPBodyType) {
    // 1. Kiểm tra email đã tồn tại trong db chưa
    const user = await this.sharedUserRepository.findUnique({
      email: body.email,
    })
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundException
    }

    // 2. Tạo mã OTP
    const code = generateOTP()
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    return verificationCode
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    // 1. Kiểm tra user có tồn tại không
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: body.email,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw InvalidPasswordException
    }
    // 2. Kiểm tra otp và totp
    // Nếu user đã bật 2FA thì kiểm tra 2FA
    if (user.totpSecret) {
      if (!body.totpCode && !body.code) {
        throw InvalidTOTPAndCodeException
      }
      if (body.totpCode) {
        const isValid = this.twoFactorService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        })
        if (!isValid) {
          throw InvalidTOTPException
        }
      } else if (body.code) {
        await this.validateVerificationCode({
          email: user.email,
          code: body.code,
          type: TypeOfVerificationCode.LOGIN,
        })
      }
    }

    // 3. Tạo mới device
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    // 4. Tạo mới accessToken và refreshToken
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId,
      }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2. Kiểm tra refreshToken có tồn tại trong database không
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })

      if (!refreshTokenInDB) {
        throw RefreshTokenAlreadyUsedException
      }

      // 3. Cập nhật device
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDB
      const $updateDevice = await this.authRepository.updateDevice(deviceId, {
        userAgent,
        ip,
      })

      // 4. Xóa refreshToken cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })
      // 5. Tạo mới accessToken và refreshToken
      const $tokens = this.generateTokens({
        userId,
        roleId,
        roleName,
        deviceId,
      })

      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])
      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // 1. Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken)

      // 2. Xóa refreshToken trong database
      const refreshTokenDeleted = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      })

      // 3. Cập nhật Device là không hoạt động

      await this.authRepository.updateDevice(refreshTokenDeleted.deviceId, {
        isActive: false,
      })

      return { message: 'Đăng xuất thành công' }
    } catch (error) {
      // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
      // refresh token của họ đã bị đánh cắp
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenAlreadyUsedException
      }
      throw new UnauthorizedException()
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    // 1. Kiểm tra email có tồn tại trong db không

    const user = await this.sharedUserRepository.findUnique({
      email,
    })
    if (!user) {
      throw EmailNotFoundException
    }

    //2. Kiểm tra mã OTP có hợp lệ không
    await this.validateVerificationCode({
      email,
      code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
    })

    // 3. Cập nhật lại password và xóa OTP
    const hashedPassword = await this.hashingService.hash(newPassword)
    await Promise.all([
      this.authRepository.updateUser(
        { id: user.id },
        {
          password: hashedPassword,
        },
      ),
      this.authRepository.deleteVerificationCode({
        email_type: {
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
        },
      }),
    ])
    return { message: 'Đổi mật khẩu thành công' }
  }

  async setupTwoFactorAuth(userId: number) {
    // 1. Kiểm tra user theo email
    console.log('userId: ', userId)
    const user = await this.sharedUserRepository.findUnique({
      id: userId,
    })

    if (!user) {
      throw EmailNotFoundException
    }

    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException
    }
    // 2. Tạo secret và uri cho 2FA
    const { secret, uri } = this.twoFactorService.generateTOTP(user.email)
    // 3. Lưu secret vào database
    await this.authRepository.updateUser(
      { id: user.id },
      {
        totpSecret: secret,
      },
    )
    // 4. Trả về uri cho người dùng quét
    return {
      secret,
      uri,
    }
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, totpCode, code } = data
    // 1. Kiểm tra user theo userId
    const user = await this.sharedUserRepository.findUnique({
      id: data.userId,
    })

    if (!user) {
      throw EmailNotFoundException
    }
    if (!user.totpSecret) {
      throw TOTPNotEnabledException
    }

    // 2. Kiểm tra mã OTP có hợp lệ không
    if (totpCode) {
      const isValid = this.twoFactorService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: totpCode,
      })
      if (!isValid) {
        throw InvalidTOTPException
      }
    } else if (code) {
      // 3. Kiểm tra mã OTP email có hợp lệ hay không
      await this.validateVerificationCode({
        email: user.email,
        code,
        type: TypeOfVerificationCode.DISABLE_2FA,
      })
    }

    // 4. Cập nhật secret thành null
    await this.authRepository.updateUser({ id: userId }, { totpSecret: null })

    // 5. Trả về thông báo
    return {
      message: 'Tắt 2FA thành công',
    }
  }
}
