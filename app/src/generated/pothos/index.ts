/* eslint-disable */
import type { Prisma, Comment, User, Account, Session, VerificationToken, Seed, Log, Occupancy, Prediction, Space } from "@prisma/client";
export default interface PrismaTypes {
    Comment: {
        Name: "Comment";
        Shape: Comment;
        Include: Prisma.CommentInclude;
        Select: Prisma.CommentSelect;
        OrderBy: Prisma.CommentOrderByWithRelationInput;
        WhereUnique: Prisma.CommentWhereUniqueInput;
        Where: Prisma.CommentWhereInput;
        Create: Prisma.CommentCreateInput;
        Update: Prisma.CommentUpdateInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User | null;
                Name: "User";
            };
        };
    };
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: Prisma.UserCreateInput;
        Update: Prisma.UserUpdateInput;
        RelationName: "accounts" | "sessions" | "comments";
        ListRelations: "accounts" | "sessions" | "comments";
        Relations: {
            accounts: {
                Shape: Account[];
                Name: "Account";
            };
            sessions: {
                Shape: Session[];
                Name: "Session";
            };
            comments: {
                Shape: Comment[];
                Name: "Comment";
            };
        };
    };
    Account: {
        Name: "Account";
        Shape: Account;
        Include: Prisma.AccountInclude;
        Select: Prisma.AccountSelect;
        OrderBy: Prisma.AccountOrderByWithRelationInput;
        WhereUnique: Prisma.AccountWhereUniqueInput;
        Where: Prisma.AccountWhereInput;
        Create: Prisma.AccountCreateInput;
        Update: Prisma.AccountUpdateInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
        };
    };
    Session: {
        Name: "Session";
        Shape: Session;
        Include: Prisma.SessionInclude;
        Select: Prisma.SessionSelect;
        OrderBy: Prisma.SessionOrderByWithRelationInput;
        WhereUnique: Prisma.SessionWhereUniqueInput;
        Where: Prisma.SessionWhereInput;
        Create: Prisma.SessionCreateInput;
        Update: Prisma.SessionUpdateInput;
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
            };
        };
    };
    VerificationToken: {
        Name: "VerificationToken";
        Shape: VerificationToken;
        Include: never;
        Select: Prisma.VerificationTokenSelect;
        OrderBy: Prisma.VerificationTokenOrderByWithRelationInput;
        WhereUnique: Prisma.VerificationTokenWhereUniqueInput;
        Where: Prisma.VerificationTokenWhereInput;
        Create: Prisma.VerificationTokenCreateInput;
        Update: Prisma.VerificationTokenUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Seed: {
        Name: "Seed";
        Shape: Seed;
        Include: never;
        Select: Prisma.SeedSelect;
        OrderBy: Prisma.SeedOrderByWithRelationInput;
        WhereUnique: Prisma.SeedWhereUniqueInput;
        Where: Prisma.SeedWhereInput;
        Create: Prisma.SeedCreateInput;
        Update: Prisma.SeedUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Log: {
        Name: "Log";
        Shape: Log;
        Include: never;
        Select: Prisma.LogSelect;
        OrderBy: Prisma.LogOrderByWithRelationInput;
        WhereUnique: Prisma.LogWhereUniqueInput;
        Where: Prisma.LogWhereInput;
        Create: Prisma.LogCreateInput;
        Update: Prisma.LogUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Occupancy: {
        Name: "Occupancy";
        Shape: Occupancy;
        Include: never;
        Select: Prisma.OccupancySelect;
        OrderBy: Prisma.OccupancyOrderByWithRelationInput;
        WhereUnique: Prisma.OccupancyWhereUniqueInput;
        Where: Prisma.OccupancyWhereInput;
        Create: Prisma.OccupancyCreateInput;
        Update: Prisma.OccupancyUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Prediction: {
        Name: "Prediction";
        Shape: Prediction;
        Include: never;
        Select: Prisma.PredictionSelect;
        OrderBy: Prisma.PredictionOrderByWithRelationInput;
        WhereUnique: Prisma.PredictionWhereUniqueInput;
        Where: Prisma.PredictionWhereInput;
        Create: Prisma.PredictionCreateInput;
        Update: Prisma.PredictionUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Space: {
        Name: "Space";
        Shape: Space;
        Include: never;
        Select: Prisma.SpaceSelect;
        OrderBy: Prisma.SpaceOrderByWithRelationInput;
        WhereUnique: Prisma.SpaceWhereUniqueInput;
        Where: Prisma.SpaceWhereInput;
        Create: Prisma.SpaceCreateInput;
        Update: Prisma.SpaceUpdateInput;
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}