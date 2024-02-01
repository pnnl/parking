import "./comments/object";
import "./logs/object";
import "./users/object";
import "./comments/input";
import "./logs/input";
import "./users/input";
import "./comments/query";
import "./current/query";
import "./logs/query";
import "./users/query";
import "./comments/mutate";
import "./logs/mutate";
import "./current/mutate";
import "./users/mutate";

import { builder } from "./builder";

export const schema = builder.toSchema({});
