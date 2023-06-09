import { Injectable } from '@nestjs/common';
import { Types, Schema } from 'mongoose';
import { UserDocument } from 'src/auth/strategies/jwt.strategy';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
import { ProductCheckoutDTO } from './dto/product-checkout.dto';
import { RemoveProductCheckoutDTO } from './dto/remove-product-checkout.dto';

@Injectable()
export class MeService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
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

  async showFavourite(userDocument: UserDocument) {
    const products = userDocument.favouriteProducts;
    return await this.productsService.productModel
      .find({ _id: { $in: products } })
      .lean();
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

  async saveFavourites(userDoc: UserDocument, id: string) {
    if (
      userDoc.favouriteProducts.some((e) => {
        return e._id.toString() == id;
      })
    )
      return;
    userDoc.favouriteProducts.push(new Types.ObjectId(id));
    return await userDoc.save();
  }

  async removeFromFavourite(userDocument: UserDocument, id: string) {
    let index = userDocument.favouriteProducts.findIndex(
      (e) => e._id.toString() == id,
    );
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
