import { serverConfig } from './config.js';

const getMoveTarget = (pkg: string, fun: string) =>
  `${serverConfig.PACKAGE_ID}::${pkg}::${fun}`;

export default getMoveTarget;