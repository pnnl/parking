"use server";

import { NextApiRequest, NextApiResponse } from "next";

import axios from "axios";
import { isArray } from "lodash";
import { logger } from "@/logging";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  let { params, z, x, y } = req.query ?? {};
  if (isArray(params) && params.length > 3) {
    [z, x, y] = params;
  }
  const url = `http://${process.env.OSM_HOST}:${process.env.OSM_PORT}/tile/${z}/${x}/${y}.png`;
  return axios({
    method: "get",
    url: url,
    responseType: "stream",
  })
    .then(({ data }) => {
      data.pipe(res);
    })
    .catch((error: any) => {
      logger.debug(error, url);
      res.status(404).end();
    });
};

export default handleRequest;
