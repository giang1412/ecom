import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewRepository } from './review.repo'
import { ReviewController } from 'src/routes/review/review.controller'

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
