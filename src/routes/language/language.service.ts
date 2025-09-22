import { Injectable, NotFoundException } from '@nestjs/common'
import { LanguageAlreadyExistsException } from 'src/routes/language/language.error'
import {
  CreateLanguageBodyType,
  GetLanguageParamsType,
  UpdateLanguageBodyType,
} from 'src/routes/language/language.model'
import { LanguageRepo } from 'src/routes/language/language.repo'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class LanguageService {
  constructor(private languageRepo: LanguageRepo) {}

  async findAll() {
    const data = await this.languageRepo.findAll()
    return {
      data,
      totalItems: data.length,
    }
  }

  async create({ createdById, data }: { createdById: number; data: CreateLanguageBodyType }) {
    try {
      return await this.languageRepo.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException
      }
      throw error
    }
  }

  async findById(id: string) {
    const language = await this.languageRepo.findById(id)
    if (!language) throw NotFoundRecordException
    return language
  }

  async update({ id, updatedById, data }: { id: string; updatedById: number; data: UpdateLanguageBodyType }) {
    try {
      const lang = await this.languageRepo.update({
        id,
        updatedById,
        data,
      })
      return lang
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }

  async delete(id: string) {
    try {
      // hard delete
      await this.languageRepo.delete(id, true)
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
