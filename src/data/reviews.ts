
export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    date: string;
    helpfulCount: number;
}

export const mockReviews: Review[] = [
    {
        id: "1",
        productId: "1",
        userId: "user1",
        userName: "Sarah Johnson",
        rating: 5,
        comment: "This guide completely transformed my kitchen! The labels are beautiful and the organization tips are so practical.",
        date: "2023-11-15T10:00:00Z",
        helpfulCount: 12,
    },
    {
        id: "2",
        productId: "1",
        userId: "user2",
        userName: "Mike Chen",
        rating: 4,
        comment: "Great content, but I wish there were more color options for the printable labels. Still worth the money though.",
        date: "2023-11-20T14:30:00Z",
        helpfulCount: 5,
    },
    {
        id: "3",
        productId: "2",
        userId: "user3",
        userName: "Emily Davis",
        rating: 5,
        comment: "The recipes are delicious and easy to follow. Saved me so much time on weeknights.",
        date: "2023-12-01T09:15:00Z",
        helpfulCount: 8,
    },
    {
        id: "4",
        productId: "1",
        userId: "user4",
        userName: "Jessica Wilson",
        rating: 5,
        comment: "Exactly what I needed. The decluttering checklist is my favorite part.",
        date: "2023-12-05T16:45:00Z",
        helpfulCount: 3,
    }
];
