import { Request, Response, NextFunction } from "express";
import * as MenuService from "./menu.service";
import { v2 as cloudinary } from 'cloudinary';

export const getMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await MenuService.getMenuItemsService();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await MenuService.getMenuItemByIdService(parseInt(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodName, price, isAvailable } = req.body;
    
    // Cloudinary/Multer-storage adds 'path' and 'filename' to req.file
    const file = req.file as any; 
    const imageUrl = file ? file.path : null;
    const imagePublicId = file ? file.filename : null;

    const newItem = await MenuService.createMenuItemService({
      foodName,
      price: parseFloat(price),
      isAvailable: isAvailable === 'true' || isAvailable === true,
      imageUrl,
      imagePublicId
    });

    res.status(201).json({ success: true, message: "Item added", data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const existingItem = await MenuService.getMenuItemByIdService(id);
    if (!existingItem) return res.status(404).json({ success: false, message: "Item not found" });

    const file = req.file as any;
    const updateData: any = { ...req.body };

    // Parse boolean and number fields from FormData strings
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.isAvailable) updateData.isAvailable = updateData.isAvailable === 'true';

    if (file) {
      if (existingItem.imagePublicId) {
        await cloudinary.uploader.destroy(existingItem.imagePublicId);
      }
      updateData.imageUrl = file.path;
      updateData.imagePublicId = file.filename;
    }

    const updatedItem = await MenuService.updateMenuItemService(id, updateData);
    res.status(200).json({ success: true, message: "Item updated", data: updatedItem });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const item = await MenuService.getMenuItemByIdService(id);
    
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (item.imagePublicId) {
      await cloudinary.uploader.destroy(item.imagePublicId);
    }

    const success = await MenuService.deleteMenuItemService(id);
    if (!success) throw new Error("Database deletion failed");

    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error) {
    next(error);
  }
};