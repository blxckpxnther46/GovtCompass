// src/models/Scheme.js

import mongoose from "mongoose";

const schemeSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    timestamps: false,
  }
);

export const Scheme = mongoose.model(
  "Scheme",
  schemeSchema,
  "schemes"
);