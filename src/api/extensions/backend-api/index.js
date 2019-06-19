import { apiStatus } from "../../../lib/util";
import { Router } from "express";
import axios from "axios";

module.exports = ({ config }) => {
  let backApi = Router();

  backApi.get("/product", async (req, res) => {
    const { data } = await axios.get("http://localhost:3001/items");
    apiStatus(res, data, 200);
  });

  return backApi;
};
