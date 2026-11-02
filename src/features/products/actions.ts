"use server";

import { requireWebsiteOwner } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/actions/result";
import { addCategory, removeProduct, saveProduct } from "./service";
import type { Product } from "./types";

// No revalidatePath here: the Products screen keeps its list in state and updates it from the
// returned product, so saving never re-renders the page on the server.

export async function createProductAction(
  websiteId: string,
  _prev: ActionResult<Product> | null,
  formData: FormData,
): Promise<ActionResult<Product>> {
  await requireWebsiteOwner(websiteId);
  return saveProduct(websiteId, null, formData);
}

export async function updateProductAction(
  websiteId: string,
  productId: string,
  _prev: ActionResult<Product> | null,
  formData: FormData,
): Promise<ActionResult<Product>> {
  await requireWebsiteOwner(websiteId);
  return saveProduct(websiteId, productId, formData);
}

export async function deleteProductAction(websiteId: string, productId: string): Promise<ActionResult> {
  await requireWebsiteOwner(websiteId);
  return removeProduct(websiteId, productId);
}

export async function createCategoryAction(websiteId: string, formData: FormData): Promise<ActionResult<string>> {
  await requireWebsiteOwner(websiteId);
  return addCategory(websiteId, formData);
}
