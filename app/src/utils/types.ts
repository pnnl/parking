export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type IType = "occupancy" | "prediction";

export interface IBase {
  sensors: number;
  shapeLength: number;
  state?: boolean[];
}

export type ISpace<T extends IType> = {
  [K in T]: number;
};
