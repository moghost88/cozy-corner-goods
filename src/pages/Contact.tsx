import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
            title: t("contact.successTitle"),
            description: t("contact.successDesc"),
        });

        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSubmitting(false);
    };

    const contactInfo = [
        {
            icon: Mail,
            title: t("contact.email"),
            value: "support@cozycorner.com",
        },
        {
            icon: Phone,
            title: t("contact.phone"),
            value: "+1 (555) 123-4567",
        },
        {
            icon: MapPin,
            title: t("contact.address"),
            value: "123 Cozy Street, Comfort City, CC 12345",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {t("contact.title")}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {t("contact.subtitle")}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        {contactInfo.map((info, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                                        <info.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{info.title}</h3>
                                        <p className="text-sm text-muted-foreground">{info.value}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <Card className="lg:col-span-2 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t("contact.name")}</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder={t("contact.namePlaceholder")}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t("auth.email")}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder={t("contact.emailPlaceholder")}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">{t("contact.subject")}</Label>
                                <Input
                                    id="subject"
                                    value={formData.subject}
                                    onChange={(e) =>
                                        setFormData({ ...formData, subject: e.target.value })
                                    }
                                    placeholder={t("contact.subjectPlaceholder")}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">{t("contact.message")}</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({ ...formData, message: e.target.value })
                                    }
                                    placeholder={t("contact.messagePlaceholder")}
                                    rows={6}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    t("common.loading")
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        {t("contact.send")}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Contact;
