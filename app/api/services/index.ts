// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import SatoshiGameService from "./SatoshiGameService";

// Using this export method to maintain a shared storage between .ts files
export default {
  SatoshiGameService: new SatoshiGameService(),
};
