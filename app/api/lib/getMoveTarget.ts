import { serverConfig } from './config';

const getMoveTarget = (pkg: string, fun: string) =>
  `${serverConfig.PACKAGE_ID}::${pkg}::${fun}`;

export default getMoveTarget;