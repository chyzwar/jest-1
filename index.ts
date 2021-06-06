import { transformSync, Options } from '@swc/core'

/**
 * Based on https://jestjs.io/docs/next/code-transformation
 */
interface Transformer<OptionType = Options> {
  canInstrument?: boolean;
  createTransformer?: (options?: OptionType) => Transformer;

  getCacheKey?: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<OptionType>,
  ) => string;
  process: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<OptionType>,
  ) => TransformedSource;
}

interface TransformOptions<OptionType> {
  cacheFS: Map<string, string>;
  config: any;
  configString: string;
  instrument: boolean;
  supportsDynamicImport: boolean;
  supportsExportNamespaceFrom: boolean;
  supportsStaticESM: boolean;
  supportsTopLevelAwait: boolean;
  transform: any;
  transformerConfig: OptionType;
}

type TransformedSource = { code: string; map?: string }

interface JestAdditional {
  jsc: {
    transform: {
      hidden: {
        jest: true
      }
    },
  },
}

const defaultOptions: Options & JestAdditional = {
  jsc: {
    transform: {
      hidden: {
        jest: true
      }
    },
  },
  module: {
    type: "commonjs"
  }
}

const getTransformOptions = (transformerConfig: Options, sourcePath: string): Options => {
  return {
    ...defaultOptions,
    ...transformerConfig,
    filename: sourcePath,
    jsc: {
      ...defaultOptions.jsc,
      ...transformerConfig?.jsc,
      transform: {
        ...defaultOptions.jsc.transform,
        ...transformerConfig?.jsc?.transform,
      }
    }
  };
}


const transformer: Transformer<Options> = {
  process: (
    sourceText: string,
    sourcePath: string,
    options: TransformOptions<Options>,
  ): TransformedSource => {
    const { transformerConfig } = options;

    return transformSync(
      sourceText,
      getTransformOptions(transformerConfig, sourcePath)
    );
  }
}

export = transformer;
