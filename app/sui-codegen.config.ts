import type { SuiCodegenConfig } from "@mysten/codegen";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const config: SuiCodegenConfig = {
	output: './src/__generated__',
	generateSummaries: true,
	prune: true,
	packages: [
		{
			package: '@local-pkg/satoshi-flip',
			path: path.join(__dirname, '../satoshi_flip'),
		},
	],
};

export default config;