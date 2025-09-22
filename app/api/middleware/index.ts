// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextFunction, Request, Response } from "express";

// @todo: define in a const files specific error codes
const errorCode = 400;

// Handles errors related to non existing endpoints
function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error("Not Found: " + req.originalUrl);
  next(error);
}

// Handles generic errors that can happen during execution of the services
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res
    .status(res.statusCode || 500)
    .send({
      message: err.message || err,
      stack: err.stack || "N/A",
      originalError: err,
    });
  console.error("Error Handler:", err);
}

// Used as parameter checking in the /start endpint
function checkStart(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.minAmount)
      throw new Error('Parameter "minAmount" is required');
    if (!req?.body?.maxAmount)
      throw new Error('Parameter "maxAmount" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

// Used as parameter checking in the /end endpint
function checkEnd(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.gameId) throw new Error('Parameter "gameId" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

function checkSinglePlayerEnd(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.gameId) throw new Error('Parameter "gameId" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

function checkSign(req: Request, res: Response, next: NextFunction) {
  checkEnd(req, res, next);
}

function checkRegisterGame(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.gameId) throw new Error('Parameter "gameId" is required');
    if (!req?.body?.txnDigest)
      throw new Error('Parameter "txnDigest" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

function checkPlayGame(req: Request, res: Response, next: NextFunction) {
  const requiredParams = ["gameId", "txnDigest"];
  try {
    requiredParams.forEach((param) => {
      if (!req?.body?.[param])
        throw new Error(`Parameter "${param}" is required`);
    });
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

function checkVerify(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req?.body?.msg) throw new Error('Parameter "msg" is required');
    if (!req?.body?.sig) throw new Error('Parameter "sig" is required');
  } catch (error) {
    res.status(errorCode);
    next(error);
  }

  next();
}

export {
  notFound,
  errorHandler,
  checkStart,
  checkEnd,
  checkSinglePlayerEnd,
  checkRegisterGame,
  checkSign,
  checkPlayGame,
  checkVerify,
};
