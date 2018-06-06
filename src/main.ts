import { getPredictionFn } from "./index";

const main = async () => {
  const testStats = { DEX: 16, STR: 13, CON: 11, INT: 14, WIS: 5, CHA: 10 };
  const predFn = await getPredictionFn();
  const results = await predFn(testStats);
  console.log(JSON.stringify(results));
}

main();