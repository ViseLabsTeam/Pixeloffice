import data from '../data/demo-map.json';
import { validateMap } from './validation';
export const demoMap = validateMap(data);
