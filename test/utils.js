import fs from 'fs';
import yaml from 'js-yaml';

function loadYaml(path) {
  const filename = `${__dirname}/yamls/${path}.yaml`;
  const content = fs.readFileSync(filename, 'utf8');
  return yaml.safeLoad(content);
};

export default {
  loadYaml,
};
