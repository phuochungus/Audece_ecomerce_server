import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import ObjectIdStringValidationPipe from 'src/pipes/validate-mongoId.pipe';
import JWTAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { MarkUserFavouriteProductsInterceptor } from 'src/interceptors/mark-user-favourite-products.interceptor';
import QueryProductWithFilterDTO from './dto/query-product-with-filter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { query } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouriteProductsInterceptor)
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get('/product/:id')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouriteProductsInterceptor)
  async findOne(@Param('id', ObjectIdStringValidationPipe) productId: string) {
    return await this.productsService.findOne(productId);
  }

  @Patch('/product/:id')
  update(
    @Param('id', ObjectIdStringValidationPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Get('best-sellers')
  @ApiTags('products')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouriteProductsInterceptor)
  async findBestSellers(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    return await this.productsService.findBestSellers(page);
  }

  @ApiTags('products')
  @Get('best-sale-off')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouriteProductsInterceptor)
  async findBestSaleOff(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    return await this.productsService.findBestSaleOff(page);
  }

  @Get('search-filter')
  @ApiTags('products')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(MarkUserFavouriteProductsInterceptor)
  async getProductByFilter(
    @Query() queryProductWithFilterDto: QueryProductWithFilterDTO,
  ) {
    return await this.productsService.findWithFilter(queryProductWithFilterDto);
  }

  @Post('/search')
  async search(@Body('query') queryString: string) {
    return await this.productsService.search(queryString);
  }
}
