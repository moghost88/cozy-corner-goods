import { ChevronLeft, ChevronRight, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creators } from "@/data/products";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const CreatorSpotlight = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, dir } = useLanguage();

  const nextCreator = () => {
    setCurrentIndex((prev) => (prev + 1) % creators.length);
  };

  const prevCreator = () => {
    setCurrentIndex((prev) => (prev - 1 + creators.length) % creators.length);
  };

  return (
    <section className="py-16" dir={dir}>
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              {t("creator.title")} <span className="text-primary">{t("creator.titleHighlight")}</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("creator.subtitle")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={dir === "rtl" ? nextCreator : prevCreator}
              className="rounded-full"
              aria-label={t("common.previous") || "Previous"}
            >
              <ChevronLeft className={`h-5 w-5 ${dir === "rtl" ? "rotate-180" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={dir === "rtl" ? prevCreator : nextCreator}
              className="rounded-full"
              aria-label={t("common.next") || "Next"}
            >
              <ChevronRight className={`h-5 w-5 ${dir === "rtl" ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${dir === "rtl" ? "" : "-"}${currentIndex * 100}%)` }}
          >
            {creators.map((creator, index) => (
              <div
                key={creator.id}
                className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)]"
              >
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover">
                  {/* Decorative gradient */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

                  <div className="relative">
                    {/* Avatar */}
                    <div className="mb-4 flex items-start gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-2xl bg-primary p-0.5">
                          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-card">
                            <span className="font-display text-xl font-bold text-primary">
                              {creator.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-card bg-green-500" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {t(`creator.${creator.id}.name`)}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {t(`creator.${creator.id}.bio`)}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {creator.products} {t("creator.products")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">
                          {creator.sales.toLocaleString()} {t("creator.sales")}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button variant="outline" className="mt-4 w-full">
                      {t("creator.viewProfile")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="mt-6 flex justify-center gap-2">
          {creators.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreatorSpotlight;
