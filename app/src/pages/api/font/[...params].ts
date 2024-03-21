"use server";

import { NextApiRequest, NextApiResponse } from "next";
import { getFirstValue, promiseFirst } from "@/utils/util";

import { isArray } from "lodash";
import { logger } from "@/logging";
import { readFile } from "fs";
import { resolve as resolvePath } from "path";

const findFont = (font: string | undefined, filename: string) =>
  new Promise<Buffer>((resolve, reject) => {
    if (font === undefined) {
      return reject(new Error("Font must be specified"));
    }
    readFile(resolvePath(process.cwd(), process.env.FONTS_PATH ?? "", font, filename), (error, data) => {
      if (error) {
        return reject(error);
      }
      resolve(data);
    });
  });

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { params } = req.query ?? {};
  let { fontstack, range } = req.query ?? {};
  if (isArray(params) && params.length > 1) {
    [fontstack, range] = params;
  }
  let fonts: string[];
  if (isArray(fontstack)) {
    fonts = fontstack;
  } else {
    fonts = getFirstValue(fontstack)?.split(",") ?? [];
  }
  range = getFirstValue(range);
  const filename = range?.toLowerCase().endsWith(".pbf") ? range : `${range}.pbf`;
  return promiseFirst(fonts.map((font) => () => findFont(font, filename)))
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch((error) => {
      logger.warn(error, `Failed to find font for: ${fonts}-${filename}`);
      return res.status(404).json("");
    });
};

export default handleRequest;
