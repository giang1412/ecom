import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CancelOrderResDTO,
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderListQueryDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
} from 'src/routes/order/order.dto'
import { OrderService } from 'src/routes/order/order.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  getOrders(@ActiveUser('userId') userId: number, @Query() query: GetOrderListQueryDTO) {
    return this.orderService.list(userId, query)
  }

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  create(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
    return this.orderService.create(userId, body)
  }

  @Get(':orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  detail(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO) {
    return this.orderService.detail(userId, param.orderId)
  }

  @Put(':orderId')
  @ZodSerializerDto(CancelOrderResDTO)
  cancel(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO, @Body() _: EmptyBodyDTO) {
    return this.orderService.cancel(userId, param.orderId)
  }
}
