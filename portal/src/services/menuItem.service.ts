import { Request } from 'express';
import { apiResponse } from '../types/res';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { AppDataSource } from '../config/database';
import { ILike } from 'typeorm';
import { Menu } from '../entity/Menu';
import { MenuItem } from '../entity/MenuItem';
import { MenuItemModifier } from '../entity/MenuItemModifier';
import { Category } from '../entity/Category';
import { Modifier } from '../entity/Modifiers';
import { Restaurant } from '../entity/Restaurant';
import { Table } from '../entity/Table';
import ExcelJS from 'exceljs';
import { logger } from '../utils/logger';

export class MenuItemService {
  private static menuRepo = AppDataSource.getRepository(Menu);
  private static itemRepo = AppDataSource.getRepository(MenuItem);
  private static itemModRepo = AppDataSource.getRepository(MenuItemModifier);

  static async getAll(req: Request | any): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req?.tenantId;
      const search = (req.query.search as string) || '';
      const restaurantId = req.query.restaurantId as string;
      const categoryId = req.query.categoryId as string;
      const isActive = req.query.isActive as string;

      const where: any = {
        restaurant: { tenantId: { id: tenantId } },
      };
      if (restaurantId) where.restaurant.id = restaurantId;
      if (categoryId) where.category = { id: categoryId };
      if (search) where.itemName = ILike(`%${search}%`);
      if (isActive === 'true' || isActive === 'false')
        where.isActive = isActive === 'true';

      const [items, total] = await this.itemRepo.findAndCount({
        where,
        relations: ['category', 'restaurant'],
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        data: items,
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async getAllRestaurantMenuItems(
    req: Request | any,
  ): Promise<apiResponse> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const restaurantId = req.params.restaurantId as string;
      const tableId = req.params.tableId as string;
      const categoryId = req.query.categoryId as string;
      const isActive = req.query.isActive as string;
      if (!restaurantId) {
        return {
          status: 400,
          message: 'Restaurant ID is required',
        };
      }
      if (!tableId) {
        return {
          status: 400,
          message: 'Table ID is required',
        };
      }
      const restaurant = await AppDataSource.getRepository(Restaurant).findOne({
        where: { id: restaurantId },
        relations: ['tenantId'],
      });
      if (!restaurant) {
        return {
          status: 400,
          message: 'Restaurant not found',
        };
      }

      const table = await AppDataSource.getRepository(Table).findOne({
        where: { id: tableId, restaurant: { id: restaurantId } },
        relations: ['tenantId', 'restaurant'],
      });

      if (!table) {
        return {
          status: 400,
          message: 'Table not found',
        };
      }
      const where: any = {
        restaurant: { id: restaurantId },
      };
      if (categoryId) where.category = { id: categoryId };
      if (search) where.itemName = ILike(`%${search}%`);
      if (isActive === 'true' || isActive === 'false')
        where.isActive = isActive === 'true';

      const [items, total] = await this.itemRepo.findAndCount({
        where,
        relations: ['category', 'restaurant'],
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        data: items,
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async create(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const {
        restaurantId,
        itemName,
        description,
        price,
        picture,
        categoryId,
        isActive,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        nutritionalInfo,
        customizations,
        modifierIds,
      } = req.body;
      if (!restaurantId) {
        return {
          status: 400,
          message: 'Restaurant ID is required',
        };
      }
      if (!categoryId) {
        return {
          status: 400,
          message: 'Category ID is required',
        };
      }
      if (!tenantId) {
        return {
          status: 400,
          message: 'Tenant ID is required',
        };
      }
      // Validate restaurant belongs to tenant via any menu lookup or direct repository
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId, tenantId: { id: tenantId } },
        relations: ['tenantId'],
      });
      if (!restaurant) return { status: 404, message: 'Restaurant not found!' };

      // Optional: validate category belongs to the same restaurant/tenant
      let category: any = undefined;
      if (categoryId) {
        category = await AppDataSource.getRepository(Category).findOne({
          where: {
            id: categoryId,
            restaurantId: { id: restaurantId },
            isDeleted: false,
          },
          relations: ['restaurantId'],
        });
        if (!category) {
          return {
            status: 400,
            message: 'Invalid category for this restaurant',
          };
        }
      }

      let item = this.itemRepo.create({
        restaurant: { id: restaurantId } as any,
        itemName,
        description,
        tenantId,
        price,
        picture,
        category: categoryId ? ({ id: categoryId } as any) : undefined,
        isActive: isActive ?? true,
        isVegetarian: isVegetarian ?? false,
        isVegan: isVegan ?? false,
        isGlutenFree: isGlutenFree ?? false,
        isSpicy: isSpicy ?? false,
        nutritionalInfo,
        customizations,
        modifierLinks: (modifierIds || []).map((id: string) => ({
          modifier: { id } as Modifier,
        })) as any,
      });

      item = await this.itemRepo.save(item);
      return {
        status: 200,
        message: 'Menu item created successfully!',
        data: item,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async update(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { id } = req.params;
      const {
        itemName,
        description,
        price,
        picture,
        categoryId,
        isActive,
        isVegetarian,
        isVegan,
        isGlutenFree,
        isSpicy,
        nutritionalInfo,
        customizations,
        modifierIds,
      } = req.body;

      let item = await this.itemRepo.findOne({
        where: { id },
        relations: [
          'restaurant',
          'modifierLinks',
          'modifierLinks.modifier',
          'category',
          'tenantId',
        ],
      });
      if (!item) return { status: 404, message: 'Menu item not found!' };
      if ((item as any)?.tenantId?.id !== tenantId) {
        return { status: 403, message: 'Not allowed to modify this item' };
      }

      if (categoryId) {
        const validCategory = await AppDataSource.getRepository(
          Category,
        ).findOne({
          where: {
            id: categoryId,
            restaurantId: { id: (item as any).restaurant?.id },
            isDeleted: false,
          },
          relations: ['restaurantId'],
        });
        if (!validCategory) {
          return {
            status: 400,
            message: 'Invalid category for this restaurant',
          };
        }
        (item as any).category = { id: categoryId } as any;
      }
      item.itemName = itemName ?? item.itemName;
      item.description = description ?? item.description;
      item.price = price ?? item.price;
      item.picture = picture ?? item.picture;
      item.isActive = typeof isActive === 'boolean' ? isActive : item.isActive;
      item.isVegetarian =
        typeof isVegetarian === 'boolean' ? isVegetarian : item.isVegetarian;
      item.isVegan = typeof isVegan === 'boolean' ? isVegan : item.isVegan;
      item.isGlutenFree =
        typeof isGlutenFree === 'boolean' ? isGlutenFree : item.isGlutenFree;
      item.isSpicy = typeof isSpicy === 'boolean' ? isSpicy : item.isSpicy;
      item.nutritionalInfo = nutritionalInfo ?? item.nutritionalInfo;
      item.customizations = customizations ?? item.customizations;

      if (Array.isArray(modifierIds)) {
        // Replace modifier links
        await this.itemModRepo.delete({ menuItem: { id } as any });
        (item as any).modifierLinks = modifierIds.map((modId: string) => ({
          modifier: { id: modId } as Modifier,
        })) as any;
      }

      item = await this.itemRepo.save(item);
      return {
        status: 200,
        message: 'Menu item updated successfully!',
        data: item,
      };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async delete(req: Request | any): Promise<apiResponse> {
    try {
      const tenantId = req?.tenantId;
      const { id } = req.params;

      const item = await this.itemRepo.findOne({
        where: { id },
        relations: ['restaurant'],
      });
      if (!item) return { status: 404, message: 'Menu item not found!' };
      if (((item as any).restaurant as any)?.tenantId?.id !== tenantId) {
        return { status: 403, message: 'Not allowed to delete this item' };
      }

      await this.itemRepo.delete({ id });
      return { status: 200, message: 'Menu item deleted successfully!' };
    } catch (error: any) {
      return { status: 500, error: error.message };
    }
  }

  static async createFromExcel(req: Request | any): Promise<apiResponse> {
    try {
      const file = req?.file;
      const tenantId = req?.tenantId;
      const restaurantId = req.params.id;

      if (!restaurantId) {
        return {
          status: 400,
          message: 'Restaurant ID is required',
        };
      }

      if (!tenantId) {
        return {
          status: 400,
          message: 'Tenant ID is required',
        };
      }

      if (!file) {
        return { status: 400, message: 'No Excel file uploaded' };
      }

      // Validate restaurant belongs to tenant
      const restaurant = await AppDataSource.getRepository(
        'Restaurant',
      ).findOne({
        where: { id: restaurantId, tenantId: { id: tenantId } },
        relations: ['tenantId'],
      });

      if (!restaurant) {
        return { status: 404, message: 'Restaurant not found!' };
      }

      // Read and parse Excel file from buffer
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);

      const worksheet = workbook.getWorksheet(1); // Get first worksheet
      if (!worksheet) {
        return { status: 400, message: 'Excel file is empty or invalid' };
      }

      // Get header row (assume first row is headers)
      const headerRow = worksheet.getRow(1);
      const headers: string[] = [];
      headerRow.eachCell({ includeEmpty: false }, (cell) => {
        headers.push(cell.value?.toString().toLowerCase().trim() || '');
      });

      // Expected columns mapping
      const columnMap: { [key: string]: string } = {
        itemname: 'itemName',
        'item name': 'itemName',
        name: 'itemName',
        description: 'description',
        desc: 'description',
        price: 'price',
        picture: 'picture',
        image: 'picture',
        categoryid: 'categoryId',
        'category id': 'categoryId',
        category: 'categoryId',
        isactive: 'isActive',
        'is active': 'isActive',
        active: 'isActive',
        isvegetarian: 'isVegetarian',
        'is vegetarian': 'isVegetarian',
        vegetarian: 'isVegetarian',
        isvegan: 'isVegan',
        'is vegan': 'isVegan',
        vegan: 'isVegan',
        isglutenfree: 'isGlutenFree',
        'is gluten free': 'isGlutenFree',
        glutenfree: 'isGlutenFree',
        isspicy: 'isSpicy',
        'is spicy': 'isSpicy',
        spicy: 'isSpicy',
        nutritionalinfo: 'nutritionalInfo',
        'nutritional info': 'nutritionalInfo',
        nutrition: 'nutritionalInfo',
        customizations: 'customizations',
        customization: 'customizations',
        modifierids: 'modifierIds',
        'modifier ids': 'modifierIds',
        modifiers: 'modifierIds',
      };

      // Find column indices
      const columnIndices: { [key: string]: number } = {};
      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase().trim();
        if (columnMap[normalizedHeader]) {
          columnIndices[columnMap[normalizedHeader]] = index + 1; // ExcelJS uses 1-based indexing
        }
      });

      // Validate required columns
      if (!columnIndices['itemName']) {
        return {
          status: 400,
          message:
            'Required column "itemName" (or "Item Name", "Name") not found in Excel file',
        };
      }

      if (!columnIndices['price']) {
        return {
          status: 400,
          message: 'Required column "price" not found in Excel file',
        };
      }

      if (!columnIndices['categoryId']) {
        return {
          status: 400,
          message:
            'Required column "categoryId" (or "Category ID", "Category") not found in Excel file',
        };
      }

      // Process rows
      const results: {
        success: any[];
        errors: Array<{ row: number; error: string }>;
      } = {
        success: [],
        errors: [],
      };

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        try {
          // Check if row is empty
          const rowValues = Array.isArray(row.values) ? row.values : [];
          const hasData = rowValues.some(
            (value: any, index: number) =>
              index > 0 &&
              value !== null &&
              value !== undefined &&
              value !== '',
          );
          if (!hasData) {
            continue; // Skip empty rows
          }

          // Extract data from row
          const getCellValue = (columnName: string): any => {
            const colIndex = columnIndices[columnName];
            if (!colIndex) return undefined;
            const cell = row.getCell(colIndex);
            return cell.value;
          };

          const itemName = getCellValue('itemName')?.toString().trim();
          const description =
            getCellValue('description')?.toString().trim() || '';
          const priceValue = getCellValue('price');
          const picture =
            getCellValue('picture')?.toString().trim() || undefined;
          const categoryIdValue = getCellValue('categoryId');
          const isActiveValue = getCellValue('isActive');
          const isVegetarianValue = getCellValue('isVegetarian');
          const isVeganValue = getCellValue('isVegan');
          const isGlutenFreeValue = getCellValue('isGlutenFree');
          const isSpicyValue = getCellValue('isSpicy');
          const nutritionalInfoValue = getCellValue('nutritionalInfo');
          const customizationsValue = getCellValue('customizations');
          const modifierIdsValue = getCellValue('modifierIds');

          // Validate required fields
          if (!itemName) {
            results.errors.push({
              row: rowNumber,
              error: 'Item name is required',
            });
            continue;
          }

          const price =
            typeof priceValue === 'number'
              ? priceValue
              : parseFloat(priceValue?.toString() || '0');
          if (isNaN(price) || price <= 0) {
            results.errors.push({
              row: rowNumber,
              error: 'Valid price is required',
            });
            continue;
          }

          if (!categoryIdValue) {
            results.errors.push({
              row: rowNumber,
              error: 'Category ID is required',
            });
            continue;
          }

          const categoryName = categoryIdValue?.toString().trim(); // value from CSV

          if (!categoryName) {
            results.errors.push({
              row: rowNumber,
              error: 'Category name is required',
            });
            continue;
          }

          // Look up category by name and restaurant
          const category = await AppDataSource.getRepository(Category).findOne({
            where: {
              name: categoryName,
              restaurantId: { id: restaurantId },
              isDeleted: false,
            },
          });
          if (!category) {
            results.errors.push({
              row: rowNumber,
              error: `Category with ID "${categoryName}" not found or invalid for this restaurant`,
            });
            continue;
          }

          // Parse boolean values
          const parseBoolean = (
            value: any,
            defaultValue: boolean = false,
          ): boolean => {
            if (value === undefined || value === null || value === '') {
              return defaultValue;
            }
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
              const lower = value.toLowerCase().trim();
              return ['yes', 'true', '1', 'y', 'on'].includes(lower);
            }
            if (typeof value === 'number') return value !== 0;
            return defaultValue;
          };

          const isActive = parseBoolean(isActiveValue, true);
          const isVegetarian = parseBoolean(isVegetarianValue, false);
          const isVegan = parseBoolean(isVeganValue, false);
          const isGlutenFree = parseBoolean(isGlutenFreeValue, false);
          const isSpicy = parseBoolean(isSpicyValue, false);

          // Parse JSON fields
          let nutritionalInfo: any = undefined;
          if (nutritionalInfoValue) {
            try {
              nutritionalInfo =
                typeof nutritionalInfoValue === 'string'
                  ? JSON.parse(nutritionalInfoValue)
                  : nutritionalInfoValue;
            } catch {
              // If parsing fails, treat as plain text or skip
              logger.log({
                level: 'warn',
                message: `Row ${rowNumber}: Could not parse nutritionalInfo as JSON`,
              });
            }
          }

          let customizations: any = undefined;
          if (customizationsValue) {
            try {
              customizations =
                typeof customizationsValue === 'string'
                  ? JSON.parse(customizationsValue)
                  : customizationsValue;
            } catch {
              logger.log({
                level: 'warn',
                message: `Row ${rowNumber}: Could not parse customizations as JSON`,
              });
            }
          }

          // Parse modifier IDs (comma-separated)
          let modifierIds: string[] = [];
          if (modifierIdsValue) {
            const modifierIdsStr =
              typeof modifierIdsValue === 'string'
                ? modifierIdsValue
                : modifierIdsValue.toString();
            modifierIds = modifierIdsStr
              .split(',')
              .map((id: string) => id.trim())
              .filter((id: string) => id.length > 0);
          }

          // Create menu item
          const item = this.itemRepo.create({
            restaurant: { id: restaurantId } as any,
            itemName,
            description,
            tenantId,
            price,
            picture,
            category: category ? ({ id: category.id } as any) : undefined,
            isActive,
            isVegetarian,
            isVegan,
            isGlutenFree,
            isSpicy,
            nutritionalInfo,
            customizations,
            modifierLinks: modifierIds.map((id: string) => ({
              modifier: { id } as Modifier,
            })) as any,
          });

          const savedItem = await this.itemRepo.save(item);
          results.success.push(savedItem);
        } catch (error: any) {
          logger.log({
            level: 'error',
            message: `Error processing row ${rowNumber}: ${error.message}`,
          });
          results.errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error',
          });
        }
      }

      return {
        status: 200,
        message: `Excel import completed. Success: ${results.success.length}, Errors: ${results.errors.length}`,
        data: {
          successCount: results.success.length,
          errorCount: results.errors.length,
          createdItems: results.success,
          errors: results.errors,
        },
      };
    } catch (error: any) {
      logger.log({
        level: 'error',
        message: `Error in createFromExcel: ${error.message}`,
      });
      return { status: 500, error: error.message };
    }
  }
}
