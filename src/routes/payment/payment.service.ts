import { Injectable } from '@nestjs/common'
import { PaymentRepo } from 'src/routes/payment/payment.repo'
import { WebhookPaymentBodyType } from 'src/routes/payment/payment.model'
import { PaymentProducer } from 'src/routes/payment/payment.producer'

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}
  async receiver(body: WebhookPaymentBodyType) {
    const result = await this.paymentRepo.receiver(body)
    return result
  }
}
