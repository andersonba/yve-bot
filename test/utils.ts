import * as fs from 'fs';
import * as yaml from 'js-yaml';

function loadYaml(path: string): Object {
  const filename = `${__dirname}/yamls/${path}.yaml`;
  const content = fs.readFileSync(filename, 'utf8');
  return yaml.safeLoad(content);
};

export default {
  loadYaml,
};
