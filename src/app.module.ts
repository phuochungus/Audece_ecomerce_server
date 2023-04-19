import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VouchersModule } from './vouchers/vouchers.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SizesModule } from './sizes/sizes.module';
import { ColorsModule } from './colors/colors.module';
import { ProductsModule } from './products/products.module';
import { CollectionsModule } from './collections/collections.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VouchersModule,
    ColorsModule,
    SizesModule,
    MongooseModule.forRoot(
      'mongodb+srv://dev:' +
        process.env.MONGO_PASSWORD +
        '@cluster0.av5bvih.mongodb.net/Audace_db?retryWrites=true&w=majority',
      {
        autoIndex: true,
      },
    ),
    ProductsModule,
    CollectionsModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
