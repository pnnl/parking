
export type IType = "occupancy" | "prediction";

export interface IBase {
  sensors: number;
  shapeLength: number;
  state?: boolean[];
}

export type ISpace<T extends IType> = {
  [K in T]: number;
};
