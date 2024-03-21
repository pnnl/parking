// import objects
import "./comments/object";
import "./logs/object";
import "./users/object";
import "./accounts/object";
// import inputs
import "./comments/input";
import "./logs/input";
import "./users/input";
import "./accounts/input";
// import queries
import "./comments/query";
import "./current/query";
import "./logs/query";
import "./users/query";
import "./accounts/query";
// import mutators
import "./comments/mutate";
import "./logs/mutate";
import "./current/mutate";
import "./users/mutate";
import "./accounts/mutate";

import { builder } from "./builder";

export const schema = builder.toSchema({});
