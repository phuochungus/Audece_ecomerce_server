import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserDocument } from 'src/auth/strategies/jwt.strategy';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
import { ProductCheckoutDTO } from './dto/product-checkout.dto';
import { RemoveProductCheckoutDTO } from './dto/remove-product-checkout.dto';
import { UpsertFavouriteProductDto } from './dto/create-favourite-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { assign } from 'lodash';
import { RemoveFavourte } from './dto/remove-favourite-product.dto';

@Injectable()
export class MeService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    @InjectModel(User.name)
    public readonly userModel: Model<User>,
  ) {}

  async showVouchers(userDoc: UserDocument) {
    await userDoc.populate({
      path: 'vouchers',
      populate: { path: 'voucher' },
    });
    return userDoc.vouchers;
  }

  async showOrders(userDocument: UserDocument, page: number) {
    const skip = 5 * page;
    const orders = userDocument.orders.splice(skip, skip + 5);
    return await this.ordersService.orderModel
      .find({ _id: { $in: orders } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async updateSelfProfile(
    userDocument: UserDocument,
    updateUserDto: UpdateUserDto,
  ) {
    // const selfId = userDocument.id;

    // await this.userModel.updateOne(
    //   {
    //     id: selfId,
    //   },
    //   updateUserDto,
    // );
    assign(userDocument, updateUserDto);
    // console.log(userDocument);
    // console.log(updateUserDto);
    return await userDocument.save();
  }

  async showFavourite(userDocument: UserDocument) {
    await Promise.all([
      userDocument.populate({
        path: 'favouriteProducts',
        populate: { path: 'product' },
      }),
      userDocument.populate({
        path: 'favouriteProducts',
        populate: { path: 'size' },
      }),
      userDocument.populate({
        path: 'favouriteProducts',
        populate: { path: 'color' },
      }),
    ]);

    return userDocument.favouriteProducts;
  }

  async showHistory(userDocument: UserDocument) {
    await Promise.all([
      userDocument.populate({
        path: 'purchaseHistory',
        populate: { path: 'product' },
      }),
      userDocument.populate({
        path: 'purchaseHistory',
        populate: { path: 'size' },
      }),
      userDocument.populate({
        path: 'purchaseHistory',
        populate: { path: 'color' },
      }),
    ]);

    return userDocument.purchaseHistory;
  }

  async upsertFavourites(
    userDoc: UserDocument,
    upsertFavouriteProductDto: UpsertFavouriteProductDto,
  ) {
    let index = userDoc.favouriteProducts.findIndex(
      (e) =>
        e.product._id.toString() == upsertFavouriteProductDto.product &&
        (e.color._id.toString() == upsertFavouriteProductDto.color ||
          !upsertFavouriteProductDto.color) &&
        (e.size._id.toString() == upsertFavouriteProductDto.size ||
          !upsertFavouriteProductDto.size),
    );
    if (index > -1) {
      userDoc.favouriteProducts[index].quantity =
        upsertFavouriteProductDto.quantity;
      return await userDoc.save();
    }
    if (!(upsertFavouriteProductDto.color && upsertFavouriteProductDto.size)) {
      let product = await this.productsService.findOne(
        upsertFavouriteProductDto.product.toString(),
      );
      upsertFavouriteProductDto.color = product.colors[0]._id.toString();
      upsertFavouriteProductDto.size = product.colors[0]._id.toString();
      userDoc.favouriteProducts.push({
        product: new Types.ObjectId(upsertFavouriteProductDto.product),
        color: product.colors[0],
        size: product.sizes[0],
        quantity: upsertFavouriteProductDto.quantity,
      });
    }
    return await userDoc.save();
  }

  async removeFromFavourite(
    userDocument: UserDocument,
    removeDto: RemoveFavourte,
  ) {
    let index: number;
    if (removeDto.color && removeDto.quantity && removeDto.size) {
      index = userDocument.favouriteProducts.findIndex(
        (e) =>
          e.product._id.toString() == removeDto.product &&
          e.color._id.toString() == removeDto.color &&
          e.size._id.toString() == removeDto.size &&
          e.quantity == removeDto.quantity,
      );
    } else {
      index = userDocument.favouriteProducts.findIndex(
        (e) => e.product._id.toString() == removeDto.product,
      );
    }
    if (index > -1) {
      userDocument.favouriteProducts.splice(index, 1);
      await userDocument.save();
    }
  }

  async pushToCart(
    userDocument: UserDocument,
    productCheckoutDTO: ProductCheckoutDTO,
  ) {
    const products = productCheckoutDTO.productCheckoutInfos.map((e) => {
      return {
        color: new Types.ObjectId(e.color),
        size: new Types.ObjectId(e.size),
        product: new Types.ObjectId(e.product),
        quantity: e.quantity,
      };
    });
    userDocument.cart = [...userDocument.cart, ...products];
    await userDocument.save();
  }

  async removeFromCart(
    userDocument: UserDocument,
    removeProductCheckoutDTO: RemoveProductCheckoutDTO,
  ) {
    for (let productId of removeProductCheckoutDTO.productIds) {
      let itemIndex = userDocument.cart.findIndex(
        (e) => e.product.toString() == productId,
      );
      if (itemIndex > -1) {
        userDocument.cart.splice(itemIndex, 1);
      }
    }
    await userDocument.save();
  }

  async updateCart(
    userDocument: UserDocument,
    productCheckoutDTO: ProductCheckoutDTO,
  ) {
    const products = productCheckoutDTO.productCheckoutInfos.map((e) => {
      return {
        color: new Types.ObjectId(e.color),
        size: new Types.ObjectId(e.size),
        product: new Types.ObjectId(e.product),
        quantity: e.quantity,
      };
    });
    userDocument.cart = products;
    await userDocument.save();
  }
}
