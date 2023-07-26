import { DatastoreProvider } from 'functional-models-orm/interfaces';
import { FunctionalModel, Model } from 'functional-models/interfaces';
import * as types from './types';
export declare const defaultGetIndexForModel: <T extends FunctionalModel>(model: Model<T>) => string;
export declare const create: ({ client, getIndexForModel, }: types.DatastoreProviderInputs) => DatastoreProvider;
