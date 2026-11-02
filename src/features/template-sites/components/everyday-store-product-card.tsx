import { formatPrice } from "@/lib/format";
import type { SiteProduct } from "../types";

export function EverydayStoreProductCard({ product }: { product: SiteProduct }) {
  return (
    <article className="es-card">
      <div className="es-card-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.name} width={700} height={525} loading="lazy" />
      </div>
      <div className="es-card-cap">
        <div>
          <h3 className="es-card-name">{product.name}</h3>
          {product.note ? <p className="es-card-note">{product.note}</p> : null}
        </div>
        <span className="es-card-price">{formatPrice(product.price, product.currency)}</span>
      </div>
    </article>
  );
}
