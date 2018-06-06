import * as tf from '@tensorflow/tfjs';
import { Sequential } from '@tensorflow/tfjs';
import { AsyncResource } from 'async_hooks';
const DEX = ["low_dex", "med_dex", "high_dex"];
const STR = ["low_str", "med_str", "high_str"];
const CON = ["low_con", "med_con", "high_con"];
const INT = ["low_int", "med_int", "high_int"];
const WIS = ["low_wis", "med_wis", "high_wis"];
const CHA = ["low_cha", "med_cha", "high_cha"];
const CLASSES = ["rogue", "barbarian", "wizard"];

const defaultMatches: any[] = [
  [{ DEX: 18, STR: 12, CON: 12, INT: 9, WIS: 11, CHA: 13 }, ["rogue"]],
  [{ DEX: 11, STR: 16, CON: 14, INT: 6, WIS: 10, CHA: 14 }, ["barbarian"]],
  [{ DEX: 10, STR: 12, CON: 13, INT: 17, WIS: 12, CHA: 12 }, ["rogue"]]
];

const testStats = { DEX: 16, STR: 13, CON: 11, INT: 14, WIS: 5, CHA: 10 };

export const getPredictionFn = async (matches = defaultMatches) => {
  const inputEnum = arrToEnum(Array.prototype.concat(DEX, STR, CON, INT, WIS, CHA));
  const outputEnum = arrToEnum(CLASSES);

  const inputs: any[] = [];
  const outputs: any[] = [];
  matches.forEach(([stats, classes]) => {
    inputs.push(encode(statsToFields(stats), inputEnum));
    outputs.push(encode(classes, outputEnum));
  })

  const model = await getTrainedModel(inputs, outputs);

  return async (stats) => {
    return predict(model, stats, inputEnum, outputEnum);
  };
}

const arrToEnum = (arr) => {
  const myEnum = {};
  for (let i = 0; i < arr.length; i++) {
    myEnum[arr[i]] = i;
  }
  return myEnum;
}

const encode = (fields, myEnum) => {
  const arr = new Array(Object.keys(myEnum).length).fill(0);
  fields.map(x => myEnum[x]).forEach(i => arr[i] = 1);
  return arr;
}

const statsToFields = (stats) => {
  const fields = Object.entries(stats)
    .map(([stat, value]) => valueToClass(stat, value))

  return fields
}

const valueToClass = (stat, value) => {
  if (value < 8) {
    return `low_${stat}`.toLowerCase();
  } else if (value >= 8 && value <= 14) {
    return `med_${stat}`.toLowerCase();
  } else {
    return `high_${stat}`.toLowerCase();
  }
}

const getTrainedModel = async (inputs, outputs) => {
  const model = tf.sequential();

  model.add(tf.layers.dense({ units: Math.floor((outputs[0].length + inputs[0].length) / 2), inputShape: [inputs[0].length] }))
  model.add(tf.layers.dense({ units: outputs[0].length }))
  model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

  const xs = tf.tensor2d(inputs, [inputs.length, inputs[0].length]);
  const ys = tf.tensor2d(outputs, [outputs.length, outputs[0].length]);

  let i = 0;
  let h;
  do {
    h = await model.fit(xs, ys, { epochs: 10 });
    console.log("Loss: ", h.history.loss[0]);
  } while (h.history.loss[0] > 0.005 && i < 100)

  return model
}

const decode = (obj, outputEnum) => {
  const invertedEnum = Object.entries(outputEnum).reduce((acc, [name, index]: [any, any]) => { acc[index] = name; return acc }, {});
  return Object.values(obj).map((x, i) => [invertedEnum[i], x]);
}

const predict = async (model: Sequential, stats, inputEnum, outputEnum) => {
  const input = encode(statsToFields(stats), inputEnum);
  const xs = tf.tensor2d(input, [1, input.length])
  const result = await (model.predict(xs) as any).data();
  return decode(result, outputEnum).sort(([, a], [, b]) => b - a);
}