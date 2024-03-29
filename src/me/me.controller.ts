import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Post,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Delete,
  Put,
  ConflictException,
  BadGatewayException,
} from '@nestjs/common';
import { MeService } from './me.service';
import JWTAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import FullUpdateUserDto, {
  UpdateUserDto,
} from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { UpdateAddressDTO } from './dto/update-address.dto';
import SaveVoucherDTO from './dto/save-voucher.dto';
import { UserDocument } from 'src/auth/strategies/jwt.strategy';
import { ApiTags } from '@nestjs/swagger';
import { ProductCheckoutDTO } from './dto/product-checkout.dto';
import { RemoveProductCheckoutDTO } from './dto/remove-product-checkout.dto';
import { UpsertFavouriteProductDto } from './dto/create-favourite-product.dto';
import { RemoveFavourte } from './dto/remove-favourite-product.dto';

@ApiTags('me')
@Controller()
@UseGuards(JWTAuthGuard)
export class MeController {
  constructor(
    private readonly meService: MeService,
    private usersService: UsersService,
  ) {}

  @Get('/profile')
  async showProfile(@CurrentUser() userDocument: UserDocument) {
    return userDocument;
  }

  @Patch('/profile')
  async updateProfile(
    @CurrentUser() userDocument: UserDocument,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.meService.updateSelfProfile(
        userDocument,
        updateUserDto,
      );
    } catch (error) {
      if (error.code == 11000)
        throw new ConflictException('email already taken');
      throw new BadGatewayException();
    }
  }

  @Get('/vouchers')
  async showVouchers(@CurrentUser() userDocument: UserDocument) {
    return await this.meService.showVouchers(userDocument);
  }

  @Get('/orders')
  async showOrders(
    @CurrentUser() userDocument: UserDocument,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    return await this.meService.showOrders(userDocument, page);
  }

  @Get('/history')
  async showHistoryItem(@CurrentUser() userDocument: UserDocument) {
    return await this.meService.showHistory(userDocument);
  }

  @Patch()
  async update(
    @CurrentUser() userDocument: UserDocument,
    @Body() updateUserDto: FullUpdateUserDto,
  ) {
    await this.usersService.updateUserInfo(userDocument, updateUserDto);
  }

  @Patch('/address')
  async updateAddress(
    @CurrentUser() userDocument: UserDocument,
    @Body() updateAddressDTO: UpdateAddressDTO,
  ) {
    await this.usersService.updateAddress(userDocument, updateAddressDTO);
  }

  @Post('/save_voucher')
  async saveVoucher(
    @CurrentUser() userDocument: UserDocument,
    @Body() saveVoucherDto: SaveVoucherDTO,
  ) {
    await this.usersService.saveVoucher(userDocument, saveVoucherDto);
  }

  @Get('/favourites')
  async showFavourites(@CurrentUser() userDocument: UserDocument) {
    return await this.meService.showFavourite(userDocument);
  }

  @Put('/favourites')
  async saveToFavourites(
    @CurrentUser() userDocument: UserDocument,
    @Body() createFavouriteProductDto: UpsertFavouriteProductDto,
  ) {
    await this.meService.upsertFavourites(
      userDocument,
      createFavouriteProductDto,
    );
  }

  @Delete('/favourites')
  async removeFromFavourites(
    @CurrentUser() userDocument: UserDocument,
    @Body() deleteFavouriteDto: RemoveFavourte,
  ) {
    await this.meService.removeFromFavourite(userDocument, deleteFavouriteDto);
  }

  @Post('/cart')
  async addToCart(
    @CurrentUser() userDocument: UserDocument,
    @Body() productCheckoutDTO: ProductCheckoutDTO,
  ) {
    await this.meService.pushToCart(userDocument, productCheckoutDTO);
  }

  @Delete('/cart')
  async removeFromCart(
    @CurrentUser() userDocument: UserDocument,
    @Body() removeProductCheckoutDTO: RemoveProductCheckoutDTO,
  ) {
    await this.meService.removeFromCart(userDocument, removeProductCheckoutDTO);
  }

  @Patch('/cart')
  async updateCart(
    @CurrentUser() userDocument: UserDocument,
    @Body() productCheckoutDTO: ProductCheckoutDTO,
  ) {
    await this.meService.updateCart(userDocument, productCheckoutDTO);
  }
}
