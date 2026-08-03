import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingBag, ShieldCheck, Plus, Minus, Zap, ExternalLink } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import type { Product } from "@/data/types";
import { useCart } from "@/context/cart";
import { useLanguage } from "@/context/language";
import { discountPercent, effectivePrice, formatBDT, getAdjustedPrices } from "@/lib/format";

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addLine } = useCart();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImg(0);
      setSelectedSize(product.sizes?.[0] ?? null);
      setQty(1);
      setAdding(false);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const currentSize = selectedSize ?? (product.sizes?.[0] || "Standard");
  const adjustedPrices = getAdjustedPrices(product, currentSize);
  const currentRegularPrice = adjustedPrices.regularPrice;
  const currentSalePrice = adjustedPrices.salePrice;
  const price = adjustedPrices.price;
  const off = discountPercent(currentRegularPrice, currentSalePrice);
  const soldOut = product.stock <= 0;

  const handleAddToCart = () => {
    if (soldOut) return;
    setAdding(true);
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[activeImg] || product.images[0],
      unitPrice: price,
      size: currentSize,
      quantity: qty,
      maxQuantity: Math.max(1, Math.min(product.stock, 10)),
    });
    toast.success(lang === "bn" ? "কার্টে যোগ করা হয়েছে" : "Added to cart", {
      description: `${product.name} (${currentSize}) x ${qty}`,
    });
    setTimeout(() => setAdding(false), 400);
  };

  const handleBuyNow = () => {
    if (soldOut) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[activeImg] || product.images[0],
      unitPrice: price,
      size: currentSize,
      quantity: qty,
      maxQuantity: Math.max(1, Math.min(product.stock, 10)),
    });
    onClose();
    navigate({ to: "/checkout" });
  };

  const handleViewDetails = () => {
    onClose();
    navigate({ to: "/product/$slug", params: { slug: product.slug } });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close X Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-foreground transition-all hover:bg-muted hover:scale-110 shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Image in Frame */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-primary/20 bg-secondary/30 p-2 shadow-inner group">
              {/* Organic Badge Overlay */}
              <div className="absolute top-3 left-3 z-10 flex gap-1">
                <span className="rounded-full bg-[#7CB342] px-3 py-1 text-[10px] font-black uppercase text-white shadow-md">
                  100% Organic
                </span>
                {off !== null && (
                  <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                    -{off}% OFF
                  </span>
                )}
              </div>

              <img
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail selector if multiple images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product details & Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {lang === "bn" ? "খাঁটি ও তাজা অর্গানিক" : "Pure & Fresh Organic"}
              </span>

              <h2 className="text-xl font-black text-foreground sm:text-2xl mt-1 leading-snug">
                {product.name}
              </h2>

              {/* Price section */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-primary">{formatBDT(price)}</span>
                {off !== null && (
                  <span className="text-sm font-semibold text-muted-foreground line-through">
                    {formatBDT(currentRegularPrice)}
                  </span>
                )}
              </div>

              {/* Size / Weight Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <span className="block text-xs font-bold text-foreground mb-1.5">
                    {lang === "bn" ? "সাইজ / ওজন চয়ন করুন:" : "Select Size / Weight:"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                          currentSize === s
                            ? "border-primary bg-primary text-white shadow-xs scale-105"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {product.shortDescription || product.description}
              </p>

              {/* View Full Details Link Button */}
              <button
                type="button"
                onClick={handleViewDetails}
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group"
              >
                <span>{lang === "bn" ? "বিস্তারিত বিবরণ দেখুন" : "View Full Details"}</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Quantity and CTA Buttons */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {lang === "bn" ? "পরিমাণ (Qty):" : "Quantity:"}
                </span>
                <div className="flex items-center rounded-xl border border-border bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1 || soldOut}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-xs font-extrabold text-foreground">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(Math.min(product.stock, 10), qty + 1))}
                    disabled={soldOut || qty >= Math.min(product.stock, 10)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-foreground hover:bg-muted disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-primary bg-primary/10 px-3 py-3 text-xs font-extrabold text-primary transition-all hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {adding ? "যোগ হচ্ছে..." : lang === "bn" ? "কার্টে রাখুন" : "Add to Cart"}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={soldOut}
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-3 text-xs font-extrabold text-white transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
                >
                  <Zap className="h-4 w-4 fill-current text-amber-300" />
                  <span>{lang === "bn" ? "সরাসরি কিনুন" : "Buy Now"}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === "bn"
                    ? "ক্যাশ অন ডেলিভারি সুবিধা (পণ্য পেয়ে মূল্য দিন)"
                    : "Cash on Delivery Available Nationwide"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
