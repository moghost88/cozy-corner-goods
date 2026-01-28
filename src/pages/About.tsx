import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Truck, Award } from "lucide-react";

const About = () => {
    const { t } = useLanguage();

    const values = [
        {
            icon: Heart,
            title: t("about.value1Title"),
            description: t("about.value1Desc"),
        },
        {
            icon: Shield,
            title: t("about.value2Title"),
            description: t("about.value2Desc"),
        },
        {
            icon: Truck,
            title: t("about.value3Title"),
            description: t("about.value3Desc"),
        },
        {
            icon: Award,
            title: t("about.value4Title"),
            description: t("about.value4Desc"),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {t("about.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {t("about.description")}
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {values.map((value, index) => (
                        <Card
                            key={index}
                            className="p-6 text-center hover:shadow-lg transition-shadow"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <value.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                            <p className="text-sm text-muted-foreground">{value.description}</p>
                        </Card>
                    ))}
                </div>

                {/* Story Section */}
                <Card className="p-8 md:p-12 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">{t("about.storyTitle")}</h2>
                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>{t("about.storyPara1")}</p>
                        <p>{t("about.storyPara2")}</p>
                        <p>{t("about.storyPara3")}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default About;
