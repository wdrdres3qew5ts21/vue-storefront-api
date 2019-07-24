import { apiStatus } from "../../../lib/util";
import { Router } from "express";
import axios from "axios";

module.exports = ({ config }) => {
  let backApi = Router();

  backApi.get("/collections", async (req, res) => {
    let {data} = await axios.get("https://a6be717e-eca1-4702-8a43-0e58e5b88921.mock.pstmn.io/items")

    apiStatus(res, data, 200)
  });

  return backApi;
};
