import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { FlattenMaps, Model, Types } from 'mongoose';
import QueryProductWithFilterDTO from './dto/query-product-with-filter.dto';

export type ProductLeanDocument = FlattenMaps<Product> & {
  _id: Types.ObjectId;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    public readonly productModel: Model<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const createdProduct = new this.productModel({
      ...createProductDto,
    });
    return await createdProduct.save();
  }

  async findAll() {
    return await this.productModel
      .find()
      .select(['-createdAt', '-updatedAt'])
      .sort({ createdAt: -1 })
      .populate({
        path: 'colors',
        select: {
          _id: 1,
          name: 1,
          hex: 1,
        },
      })
      .populate({
        path: 'sizes',
        select: {
          _id: 1,
          widthInCentimeter: 1,
          heightInCentimeter: 1,
          lable: 1,
        },
      })
      .lean();
  }

  async findOne(objectId: string) {
    const product = await this.productModel
      .findOne({ _id: objectId })
      .select(['-createdAt', '-updatedAt'])
      .populate({
        path: 'colors',
        select: {
          _id: 1,
          name: 1,
          hex: 1,
        },
      })
      .populate({
        path: 'sizes',
        select: {
          _id: 1,
          widthInCentimeter: 1,
          heightInCentimeter: 1,
          lable: 1,
        },
      })
      .lean();
    if (product) return product;
    throw new NotFoundException();
  }

  async update(objectId: string, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findOneAndUpdate(
      { _id: objectId },
      updateProductDto,
    );
    if (!product) throw new NotFoundException();
  }

  async findBestSellers(page: number) {
    return await this.productModel.aggregate([
      {
        $addFields: {
          isFavourite: false,
        },
      },
      {
        $sort: {
          sold: -1,
        },
      },
      {
        $skip: 10 * page,
      },
      { $limit: 10 },
    ]);
  }

  async findBestSaleOff(page: number) {
    return await this.productModel.aggregate([
      {
        $match: {
          $expr: {
            $ne: ['$currentPrice', '$stablePrice'],
          },
        },
      },
      {
        $addFields: {
          percentSaleOff: {
            $subtract: [1, { $divide: ['$currentPrice', '$stablePrice'] }],
          },
        },
      },
      {
        $sort: { pecentSaleOff: -1 },
      },
      {
        $skip: 10 * page,
      },
      { $limit: 10 },
    ]);
  }

  async findWithFilter(queryProductWithFilterDto: QueryProductWithFilterDTO) {
    const page = queryProductWithFilterDto.page;
    let aggregateArray = [
      {
        $match: {
          currentPrice: {
            $gte: queryProductWithFilterDto.min,
            $lte: queryProductWithFilterDto.max,
          },
        },
      },
      ...(queryProductWithFilterDto.categoryId
        ? [
            {
              $match: {
                categories: {
                  $in: [
                    new Types.ObjectId(queryProductWithFilterDto.categoryId),
                  ],
                },
              },
            },
          ]
        : []),

      {
        $skip: 10 * page,
      },
      { $limit: 10 },
    ];
    return await this.productModel.aggregate(aggregateArray);
  }

  async populateProduct(
    id: string,
    quantity: number,
  ): Promise<{
    product: ProductLeanDocument;
    quantity: number;
  }> {
    const product = await this.productModel.findOne({ _id: id }).lean();

    return { product, quantity };
  }

  async search(queryString: string) {
    const result = await this.productModel.find({
      name: new RegExp(queryString),
    });

    return result;
  }
}
