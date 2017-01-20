function ExtractCssModulesMappingPlugin(options) {
  this._options = options;
  if (!this._options.folderName) {
    throw new Error('options must have a folderName property.');
  }
}

ExtractCssModulesMappingPlugin.prototype.apply = compiler => {
  compiler.plugin('emit', (compilation, callback) => {
    const cssModules = compilation.modules.filter(m =>
      m.resource && m.resource.indexOf('/node_modules/') === -1 && m.resource.indexOf('.css') !== -1
    );

    const mapping = cssModules.reduce((acc, m) => {
      const filePath = m.resource.split(`${this._options.folderName}/`)[1];
      const source = m._source._value
        .replace('// removed by extract-text-webpack-plugin\nmodule.exports', 'locals');
      let locals;
      eval(source); // eslint-disable-line no-eval
      acc[filePath] = { locals }; // eslint-disable-line no-param-reassign
      return acc;
    }, {});

    const mappingJSON = JSON.stringify(mapping);

    // Insert this list into the Webpack build as a new file asset:
    compilation.assets['cssModulesMapping.json'] = { // eslint-disable-line no-param-reassign
      source() {
        return mappingJSON;
      },
      size() {
        return mappingJSON.length;
      },
    };

    callback();
  });
};

module.exports = ExtractCssModulesMappingPlugin;
