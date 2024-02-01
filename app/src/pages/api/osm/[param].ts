"use server";

import { NextApiRequest, NextApiResponse } from "next";

import { join } from "path";
import { readFile } from "fs";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const { param } = req.query ?? {};
  switch (param) {
    case "style":
    case "style.json":
      return new Promise<void>((resolve, reject) => {
        readFile(join(process.cwd(), process.env.OSM_STYLE ?? "../data/osm/style.json"), (err, data) => {
          if (err) {
            reject(res.status(400).json(err.message));
          }
          const json = JSON.parse(data.toString());
          res.status(200).json(json);
          resolve();
        });
      });
    default:
      res.status(404).end();
      return Promise.reject(new Error("Not Found"));
  }
};

export default handleRequest;
