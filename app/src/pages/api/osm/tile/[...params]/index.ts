import axios from "axios";
import { isArray } from "lodash";

import { logger } from "@/logging";
import { NextApiRequest, NextApiResponse } from "next";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { params } = req.query;
    let { z, x, y } = req.query;
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
        return data.pipe(res);
      })
      .catch((error: any) => {
        logger.info(error, url);
        return res.status(401).json("");
      });
  } else {
    return res.status(404).json("");
  }
};

export default handleRequest;
