import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types, Schema as mongooseSchema } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class PercentSaleOffVoucher {
  @ApiProperty({ description: 'the name of voucher', example: 'Sale off 80%' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'start YYYY-MM-DD', example: '2023-04-01' })
  @Prop({ required: true })
  start: Date;

  @ApiProperty({ description: 'end YYYY-MM-DD', example: '2023-10-15' })
  @Prop({ required: true })
  end: Date;

  @ApiProperty({
    description: 'code to activate voucher',
    example: 'SALEOFF80',
  })
  @Prop({ required: true, unique: true })
  code: string;

  @ApiProperty({ description: 'vouchers quantity', example: 500 })
  @Prop({ required: true, default: 0 })
  quantity: number;

  @ApiProperty({ description: 'amount reward by percent', example: 30 })
  @Prop({ required: true })
  amountByPercent: number;

  @ApiProperty({
    description: 'apply categories',
    example: ['640a129eb236c9802faca75c'],
  })
  @Prop({
    type: [{ type: mongooseSchema.Types.ObjectId, ref: 'Category' }],
    required: true,
  })
  appliableCategories: Types.ObjectId[];
}

export const PercentSaleOffVoucherSchema = SchemaFactory.createForClass(
  PercentSaleOffVoucher,
);
