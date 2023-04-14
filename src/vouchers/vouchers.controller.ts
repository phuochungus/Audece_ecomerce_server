import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import ParseObjectIdStringPipe from 'src/pipes/parse-objectID-string.pipe';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  async create(@Body() createVoucherDto: CreateVoucherDto) {
    return await this.vouchersService.create(createVoucherDto);
  }

  @Get()
  async findAll() {
    return await this.vouchersService.findAll();
  }

  @Get('/voucher/:voucherId')
  async findOne(
    @Param('voucherId', ParseObjectIdStringPipe) voucherId: string,
  ) {
    return await this.vouchersService.findOne(voucherId);
  }

  @Patch('/voucher/:voucherId')
  async update(
    @Param('voucherId', ParseObjectIdStringPipe) voucherId: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return await this.vouchersService.update(voucherId, updateVoucherDto);
  }

  @Delete('/voucher/:voucherId')
  async remove(@Param('voucherId', ParseObjectIdStringPipe) voucherId: string) {
    return this.vouchersService.remove(voucherId);
  }
}
