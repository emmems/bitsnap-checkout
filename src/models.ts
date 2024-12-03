import * as z from "zod";

export namespace BitsnapModels {
  export const BaselinkerFieldsSchema = z.object({
    storageID: z.string(),
  });
  export type BaselinkerFields = z.infer<typeof BaselinkerFieldsSchema>;

  export const MetadataSchema = z.record(z.string(), z.any());

  export const VariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    currency: z.string(),
    metadata: MetadataSchema,
    images: z.array(z.string()),
    availableQuantity: z.number(),
  });
  export type Variant = z.infer<typeof VariantSchema>;

  export const AdditionalSchema = z.object({
    sku: z.string(),
    baselinkerFields: BaselinkerFieldsSchema,
  });
  export type Additional = z.infer<typeof AdditionalSchema>;

  export const ItemSchema = z.object({
    id: z.string(),
    ownerID: z.string(),
    name: z.string(),
    description: z.union([z.string(), z.null()]).optional(),
    createdAt: z.number(),
    updatedAt: z.number(),
    price: z.number(),
    currency: z.string(),
    metadata: MetadataSchema,
    image_url: z.string(),
    images: z.array(z.string()),
    isDeliverable: z.boolean(),
    availableQuantity: z.number(),
    additional: AdditionalSchema,
    deletedAt: z.null(),
    variants: z.array(VariantSchema),
  });
  export type Item = z.infer<typeof ItemSchema>;

  export const DataSchema = z.object({
    success: z.boolean(),
    result: z.array(ItemSchema),
    totalCount: z.number(),
  });
  export type Data = z.infer<typeof DataSchema>;

  export const ProductsResultResultSchema = z.object({
    data: DataSchema,
  });
  export type ProductsResultResult = z.infer<typeof ProductsResultResultSchema>;

  export const ProductsResultElementSchema = z.array(
    z.object({
      result: ProductsResultResultSchema,
    }),
  );
  export type ProductsResultElement = z.infer<
    typeof ProductsResultElementSchema
  >;

  export const ProductResultSchema = z.array(
    z.object({
      result: z.object({
        data: z.object({
          success: z.boolean(),
          message: z.string().optional(),
          result: ItemSchema.optional(),
        }),
      }),
    }),
  );
}
