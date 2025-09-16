// Copyright (c) 2023, Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { config } from "dotenv";

config({});

export const packageId = process.env.PACKAGE_ADDRESS!;
export const houseCap = process.env.HOUSE_CAP!;

export const adminKey = process.env.SATOSHI_HOME_PRIVATE_KEY;

export const SUI_NETWORK = process.env.SUI_NETWORK!;

export const SATOSHI_HOME_ADDRESS = process.env.SATOSHI_HOME_ADDRESS!;
