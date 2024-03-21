/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  accessToken?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  idToken?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  providerAccountId: Scalars['String']['output'];
  refreshToken?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  sessionState?: Maybe<Scalars['String']['output']>;
  tokenType?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type AccountAggregate = {
  average?: InputMaybe<Array<AccountFields>>;
  count?: InputMaybe<Array<AccountFields>>;
  maximum?: InputMaybe<Array<AccountFields>>;
  minimum?: InputMaybe<Array<AccountFields>>;
  sum?: InputMaybe<Array<AccountFields>>;
};

export type AccountCreateInput = {
  expiresAt?: InputMaybe<Scalars['Int']['input']>;
  idToken?: InputMaybe<Scalars['String']['input']>;
  provider: Scalars['String']['input'];
  providerAccountId: Scalars['String']['input'];
  scope?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export enum AccountFields {
  AccessToken = 'accessToken',
  CreatedAt = 'createdAt',
  ExpiresAt = 'expiresAt',
  Id = 'id',
  IdToken = 'idToken',
  Provider = 'provider',
  ProviderAccountId = 'providerAccountId',
  RefreshToken = 'refreshToken',
  Scope = 'scope',
  SessionState = 'sessionState',
  TokenType = 'tokenType',
  Type = 'type',
  UpdatedAt = 'updatedAt',
  UserId = 'userId'
}

export type AccountFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<StringFilter>;
  provider?: InputMaybe<StringFilter>;
  type?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type AccountOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  provider?: InputMaybe<OrderBy>;
  type?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
  user?: InputMaybe<UserOrderBy>;
  userId?: InputMaybe<OrderBy>;
};

export type AccountUniqueFilter = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type AccountUpdateInput = {
  expiresAt?: InputMaybe<Scalars['Int']['input']>;
  idToken?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  providerAccountId?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type BooleanFilter = {
  equals?: InputMaybe<Scalars['Boolean']['input']>;
  not?: InputMaybe<BooleanFilter>;
};

export type Comment = {
  __typename?: 'Comment';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type CommentAggregate = {
  average?: InputMaybe<Array<CommentFields>>;
  count?: InputMaybe<Array<CommentFields>>;
  maximum?: InputMaybe<Array<CommentFields>>;
  minimum?: InputMaybe<Array<CommentFields>>;
  sum?: InputMaybe<Array<CommentFields>>;
};

export type CommentCreateInput = {
  message: Scalars['String']['input'];
};

export enum CommentFields {
  CreatedAt = 'createdAt',
  Id = 'id',
  Message = 'message',
  UpdatedAt = 'updatedAt',
  UserId = 'userId'
}

export type CommentFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IntFilter>;
  message?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type CommentOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  message?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
  user?: InputMaybe<UserOrderBy>;
  userId?: InputMaybe<OrderBy>;
};

export type CommentUniqueFilter = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type CommentUpdateInput = {
  message?: InputMaybe<Scalars['String']['input']>;
};

export type DateTimeFilter = {
  contains?: InputMaybe<Scalars['DateTime']['input']>;
  equals?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  not?: InputMaybe<DateTimeFilter>;
};

export type FloatFilter = {
  equals?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  not?: InputMaybe<FloatFilter>;
};

export type IntFilter = {
  equals?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  not?: InputMaybe<IntFilter>;
};

export type Log = {
  __typename?: 'Log';
  createdAt: Scalars['DateTime']['output'];
  expiration?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  message?: Maybe<Scalars['String']['output']>;
  type?: Maybe<LogType>;
  updatedAt: Scalars['DateTime']['output'];
};

export type LogAggregate = {
  average?: InputMaybe<Array<LogFields>>;
  count?: InputMaybe<Array<LogFields>>;
  maximum?: InputMaybe<Array<LogFields>>;
  minimum?: InputMaybe<Array<LogFields>>;
  sum?: InputMaybe<Array<LogFields>>;
};

export type LogCreateInput = {
  expiration?: InputMaybe<Scalars['DateTime']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<LogType>;
};

export enum LogFields {
  CreatedAt = 'createdAt',
  Expiration = 'expiration',
  Id = 'id',
  Message = 'message',
  Type = 'type',
  UpdatedAt = 'updatedAt'
}

export type LogFilter = {
  createdAt?: InputMaybe<DateTimeFilter>;
  expiration?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IntFilter>;
  message?: InputMaybe<StringFilter>;
  type?: InputMaybe<LogTypeFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type LogOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  expiration?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  message?: InputMaybe<OrderBy>;
  type?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
};

export enum LogType {
  Banner = 'Banner',
  Debug = 'Debug',
  Error = 'Error',
  Fatal = 'Fatal',
  Info = 'Info',
  Trace = 'Trace',
  Warn = 'Warn'
}

export type LogTypeFilter = {
  equals?: InputMaybe<LogType>;
  in?: InputMaybe<Array<LogType>>;
  not?: InputMaybe<LogTypeFilter>;
};

export type LogUniqueFilter = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type LogUpdateInput = {
  expiration?: InputMaybe<Scalars['DateTime']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<LogType>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new account. */
  createAccount: Account;
  /** Create a new comment. */
  createComment: Comment;
  /** Create a new log. */
  createLog: Log;
  /** Create a new user. */
  createUser: User;
  /** Delete the specified account. */
  deleteAccount: Account;
  /** Delete the specified comment. */
  deleteComment: Comment;
  /** Delete the currently logged in user. */
  deleteCurrent: User;
  /** Delete the specified log. */
  deleteLog: Log;
  /** Delete the specified user. */
  deleteUser: User;
  /** Update the specified account. */
  updateAccount: Account;
  /** Update the specified comment. */
  updateComment: Comment;
  /** Update the currently logged in user. */
  updateCurrent: User;
  /** Update the specified log. */
  updateLog: Log;
  /** Update the specified user. */
  updateUser: User;
};


export type MutationCreateAccountArgs = {
  create?: InputMaybe<AccountCreateInput>;
};


export type MutationCreateCommentArgs = {
  create?: InputMaybe<CommentCreateInput>;
};


export type MutationCreateLogArgs = {
  create?: InputMaybe<LogCreateInput>;
};


export type MutationCreateUserArgs = {
  create?: InputMaybe<UserCreateInput>;
};


export type MutationDeleteAccountArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteCommentArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteLogArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateAccountArgs = {
  id: Scalars['String']['input'];
  update?: InputMaybe<AccountUpdateInput>;
};


export type MutationUpdateCommentArgs = {
  id: Scalars['Int']['input'];
  update?: InputMaybe<CommentUpdateInput>;
};


export type MutationUpdateCurrentArgs = {
  update?: InputMaybe<UserUpdateInput>;
};


export type MutationUpdateLogArgs = {
  id: Scalars['Int']['input'];
  update?: InputMaybe<LogUpdateInput>;
};


export type MutationUpdateUserArgs = {
  id: Scalars['String']['input'];
  update?: InputMaybe<UserUpdateInput>;
};

export enum OrderBy {
  Asc = 'Asc',
  Desc = 'Desc'
}

export type PagingInput = {
  skip: Scalars['Int']['input'];
  take: Scalars['Int']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Count the number of accounts. */
  countAccounts: Scalars['Int']['output'];
  /** Count the number of comments. */
  countComments: Scalars['Int']['output'];
  /** Count the number of logs. */
  countLogs: Scalars['Int']['output'];
  /** Count the number of user. */
  countUsers: Scalars['Int']['output'];
  /** Group a list of accounts. */
  groupAccounts: Array<Scalars['JSON']['output']>;
  /** Group a list of comments. */
  groupComments: Array<Scalars['JSON']['output']>;
  /** Group a list of logs. */
  groupLogs: Array<Scalars['JSON']['output']>;
  /** Group a list of user. */
  groupUsers: Array<Scalars['JSON']['output']>;
  /** Read a unique account. */
  readAccount: Account;
  /** Read a list of accounts. */
  readAccounts: Array<Account>;
  /** Read a unique comment. */
  readComment: Comment;
  /** Read a list of comments. */
  readComments: Array<Comment>;
  /** Read the currently logged in user. */
  readCurrent: User;
  /** Read a unique log. */
  readLog: Log;
  /** Read a list of logs. */
  readLogs: Array<Log>;
  /** Read a unique user. */
  readUser: User;
  /** Read a list of user. */
  readUsers: Array<User>;
};


export type QueryCountAccountsArgs = {
  where?: InputMaybe<AccountFilter>;
};


export type QueryCountCommentsArgs = {
  where?: InputMaybe<CommentFilter>;
};


export type QueryCountLogsArgs = {
  where?: InputMaybe<LogFilter>;
};


export type QueryCountUsersArgs = {
  where?: InputMaybe<UserFilter>;
};


export type QueryGroupAccountsArgs = {
  aggregate?: InputMaybe<AccountAggregate>;
  by: Array<AccountFields>;
  where?: InputMaybe<AccountFilter>;
};


export type QueryGroupCommentsArgs = {
  aggregate?: InputMaybe<CommentAggregate>;
  by: Array<CommentFields>;
  where?: InputMaybe<CommentFilter>;
};


export type QueryGroupLogsArgs = {
  aggregate?: InputMaybe<LogAggregate>;
  by: Array<LogFields>;
  where?: InputMaybe<LogFilter>;
};


export type QueryGroupUsersArgs = {
  aggregate?: InputMaybe<UserAggregate>;
  by: Array<UserFields>;
  where?: InputMaybe<UserFilter>;
};


export type QueryReadAccountArgs = {
  where?: InputMaybe<AccountUniqueFilter>;
};


export type QueryReadAccountsArgs = {
  distinct?: InputMaybe<Array<AccountFields>>;
  orderBy?: InputMaybe<Array<AccountOrderBy>>;
  paging?: InputMaybe<PagingInput>;
  where?: InputMaybe<AccountFilter>;
};


export type QueryReadCommentArgs = {
  where?: InputMaybe<CommentUniqueFilter>;
};


export type QueryReadCommentsArgs = {
  distinct?: InputMaybe<Array<CommentFields>>;
  orderBy?: InputMaybe<Array<CommentOrderBy>>;
  paging?: InputMaybe<PagingInput>;
  where?: InputMaybe<CommentFilter>;
};


export type QueryReadLogArgs = {
  where?: InputMaybe<LogUniqueFilter>;
};


export type QueryReadLogsArgs = {
  distinct?: InputMaybe<Array<LogFields>>;
  orderBy?: InputMaybe<Array<LogOrderBy>>;
  paging?: InputMaybe<PagingInput>;
  where?: InputMaybe<LogFilter>;
};


export type QueryReadUserArgs = {
  where?: InputMaybe<UserUniqueFilter>;
};


export type QueryReadUsersArgs = {
  distinct?: InputMaybe<Array<UserFields>>;
  orderBy?: InputMaybe<Array<UserOrderBy>>;
  paging?: InputMaybe<PagingInput>;
  where?: InputMaybe<UserFilter>;
};

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  equals?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  mode?: InputMaybe<StringFilterMode>;
  not?: InputMaybe<StringFilter>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export enum StringFilterMode {
  Default = 'Default',
  Insensitive = 'Insensitive'
}

export type User = {
  __typename?: 'User';
  accounts?: Maybe<Array<Account>>;
  comments?: Maybe<Array<Comment>>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  preferences?: Maybe<Scalars['JSON']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserAggregate = {
  average?: InputMaybe<Array<UserFields>>;
  count?: InputMaybe<Array<UserFields>>;
  maximum?: InputMaybe<Array<UserFields>>;
  minimum?: InputMaybe<Array<UserFields>>;
  sum?: InputMaybe<Array<UserFields>>;
};

export type UserCreateInput = {
  email: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  preferences?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
};

export enum UserFields {
  CreatedAt = 'createdAt',
  Email = 'email',
  EmailVerified = 'emailVerified',
  Id = 'id',
  Image = 'image',
  Name = 'name',
  Preferences = 'preferences',
  Scope = 'scope',
  UpdatedAt = 'updatedAt'
}

export type UserFilter = {
  altId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  email?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  scope?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type UserOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  email?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  name?: InputMaybe<OrderBy>;
  scope?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
};

export type UserUniqueFilter = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type UserUpdateInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  preferences?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
};

export type ReadUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type ReadUsersQuery = { __typename?: 'Query', readUsers: Array<{ __typename?: 'User', createdAt: any, email?: string | null, id: string, name?: string | null, preferences?: any | null, scope?: string | null, updatedAt: any }> };


export const ReadUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReadUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ReadUsersQuery, ReadUsersQueryVariables>;