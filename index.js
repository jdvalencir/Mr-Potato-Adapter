import express from "express";
import axios from "axios";
import cors from "cors";
import { getLogger } from "./logger/logger.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
const swaggerFile = JSON.parse(fs.readFileSync("./swagger/swagger_output.json", "utf8"));

const app = express();
const logger = getLogger();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/v1/adapter/validateCitizen/:id", async (req, res) => {
  const id = req.params.id;
  const url = `https://govcarpeta-apis-4905ff3c005b.herokuapp.com/apis/validateCitizen/${id}`;

  const headers = {
    ContentType: "application/json",
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 204) {
      logger.info("No content found for the given ID.");
      return res
        .status(204)
        .json({ message: "No content found for the given ID." });
    }

    logger.info(`Response ${response.data}`);
    res.status(200).json({
      id: id,
      status: response.status,
      registered: true,
    });
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    if (error.response && error.response.status === 501) {
      return res.status(501).json({
        status: error.response.status,
        message: error.response.data,
      });
    }
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ error: error.response.data });
  }
});

app.post("/v1/adapter/registerCitizen", async (req, res) => {
  const { id, name, address, email, operatorId, operatorName } = req.body;
  const url = `https://govcarpeta-apis-4905ff3c005b.herokuapp.com/apis/registerCitizen`;

  const headers = {
    ContentType: "application/json",
  };

  try {
    const response = await axios.post(
      url,
      { id, name, address, email, operatorId, operatorName }
    );

    if (response.status === 201) {
      logger.info("Citizen registered successfully.");
      return res.status(201).json({
        id: id,
        name: name,
        operatorId: operatorId,
        message: response.data,
        status: response.status,
        registered: true,
      });
    }
  } catch (error) {
    console.log(error.response);
    if (error.response.status === 501) {
      logger.error(`Error: ${error.message}`);
      res.status(501).json({
        message: error.response.data,
      });
    }
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/v1/adapter/unregisterCitizen", async (req, res) => {
  const { id, operatorId, operatorName } = req.body;
  const url = `https://govcarpeta-apis-4905ff3c005b.herokuapp.com/apis/unregisterCitizen`;

  try {
    const response = await axios.delete(url, {
      data: { id, operatorId, operatorName },
    });

    if (response.status === 204) {
      logger.info("No content found for the given ID.");
      return res.status(204).json({
        message: "No content found for the given ID.",
      });
    }

    if (response.status === 200) {
      logger.info("Citizen unregistered successfully.");
      return res.status(200).json({
        id: id,
        operatorId: operatorId,
        message: response.data,
        status: response.status,
        unregistered: true,
      });
    }
  } catch (error) {
    if (error.response.status === 501) {
      logger.error(`Error: ${error.message}`);
      res.status(501).json({
        message: error.response.data,
        status: error.response.status,
      });
    }
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/v1/adapter/autheticateDocument", async (req, res) => {
  const { idCitizen, UrlDocument, documentTitle } = req.body;

  const url = `https://govcarpeta-apis-4905ff3c005b.herokuapp.com/apis/authenticateDocument`;

  try {
    const response = await axios.put(url, {
      idCitizen,
      UrlDocument,
      documentTitle,
    });

    if (response.status === 204) {
      logger.info("No content found for the given ID.");
      return res
        .status(204)
        .json({ message: "No content found for the given ID." });
    }

    if (response.status === 200) {
      logger.info("Document authenticated successfully.");
      return res.status(201).json({
        idCitizen: idCitizen,
        UrlDocument: UrlDocument,
        documentTitle: documentTitle,
        message: response.data,
        status: response.status,
        authenticated: true,
      });
    }
  } catch (error) {
    if (error.response.status === 501) {
      logger.error(`Error: ${error.message}`);
      res.status(501).json({
        message: error.message,
        authenticated: true,
      });
    }
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
