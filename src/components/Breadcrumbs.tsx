import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BreadcrumbItem {
    label: string;
    to?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    const { t } = useLanguage();
    const Separator = t("dir") === "rtl" ? (
        <ChevronRight className="h-4 w-4 rotate-180 text-muted-foreground/50" />
    ) : (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    );

    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                <li>
                    <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
                        {t("breadcrumb.home")}
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                        {Separator}
                        {item.to ? (
                            <Link to={item.to} className="text-muted-foreground transition-colors hover:text-foreground">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-foreground">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
