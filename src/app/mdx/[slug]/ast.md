# 编译阶段埋点实验记录
### JSX AST

这个是react定的tokens。感觉基本了解就行。反正你要用的时候还是会查。babel preset react这个预设是转换jsx的包。

JSX​

[JSX 相关](https://facebook.github.io/jsx/#prod-JSXMemberExpression)

### babel 

babel/core    【解析】babel/parser 【解析】babel/type    【AST类型】babel/traverse  【遍历AST，type和这个有关联】babel/generator 【删除或者替换完了，生成代码（有点疑惑，既然都是AST，为啥不直接把AST给V8跑得了）】

1、2可以看为同一个东西，都是解析。不过core里边更全面些。

这些库的基本用法在babel官网都可以查看。

[https://babeljs.io/docs/en/babel-core#options](https://babeljs.io/docs/en/babel-core#options)​

babeljs.io/docs/en/babel-core#options

[@babel/core · Babel](https://babeljs.io/docs/en/babel-core#options)



### 埋点思路

目前自埋点方案，有事件代理的注入组件，也可以写个公共函数去精确埋点。

事件代理的业务解耦，公共函数的话，感觉是污染了业务逻辑，太粗暴，不够优雅。但是事件代理也存在弊端，你无法精确确定哪个才是target，而且埋点数据无法精确获得。如果用data-xx存在数据敏感问题

所以既要精确又想优雅，似乎可以在编译阶段去统一处理。

比如带traceData字段的jsx attribute的element可认为是需要埋点的，如果存在要埋点的事件，则在AST重写埋点事件。$trace不管是什么，拿出来传入重写的事件。

例如

```typescript

 const handleClick = () => {
    console.log(1)
 }
 <div className='test1' onClick={handleClick} $trace="测试用例">
    测试JSX
  </div>

```



```typescript
const generate = require('@babel/generator').default;
const fs = require('fs')
// const parser = require('@babel/parser')
const babel = require('@babel/core');
const injectCaller = require('./testBabelFile');
const types = require('@babel/types')
const template = require('@babel/template').default;

const traverse = require('@babel/traverse').default

// const { promisify } = require('util');

const transform = babel.parseAsync

module.exports = async function (content, inputSourceMap, meta) {
  const filename = this.resourcePath;
  let loaderOptions = this.getOptions()

  if (
    Object.prototype.hasOwnProperty.call(loaderOptions, 'sourceMap') &&
        !Object.prototype.hasOwnProperty.call(loaderOptions, 'sourceMaps')
  ) {
    loaderOptions = Object.assign({}, loaderOptions, {
      sourceMaps: loaderOptions.sourceMap,
    });
    delete loaderOptions.sourceMap;
  }

  const programmaticOptions = Object.assign({}, loaderOptions, {
    filename,
    inputSourceMap: inputSourceMap || undefined,

    sourceMaps:
            loaderOptions.sourceMaps === undefined
              ? this.sourceMap
              : loaderOptions.sourceMaps,

    sourceFileName: filename,
  });

  delete programmaticOptions.customize;
  delete programmaticOptions.cacheDirectory;
  delete programmaticOptions.cacheIdentifier;
  delete programmaticOptions.cacheCompression;
  delete programmaticOptions.metadataSubscribers;

  if (!babel.loadPartialConfig) {
    throw new Error(
      'babel-loader ^8.0.0-beta.3 requires @babel/core@7.0.0-beta.41, but ' +
            `you appear to be using "${babel.version}". Either update your ` +
            '@babel/core version, or pin you babel-loader version to 8.0.0-beta.2',
    );
  }

  // babel.loadPartialConfigAsync is available in v7.8.0+
  const { loadPartialConfigAsync = babel.loadPartialConfig } = babel;
  const config = await loadPartialConfigAsync(
    injectCaller(programmaticOptions, this.target),
  );

  const result = await transform(content, config.options)

  let traceValue = null
  let traceHandle = null
  traverse(result, {

    JSXOpeningElement (path) {
      const isTrace = path.get('attributes')

      for (const o of isTrace) {
        if (o.node.name.name === '$trace') {
          traceValue = o.node.value.value

          for (const so of isTrace) {
            if (so.node.name.name === 'onClick') {
              traceHandle = so.node.value.expression.name
              console.log(traceValue, traceHandle)

              traverse(result, {
                enter (epath) {
                  if (epath.isVariableDeclarator()) {
                    if (epath.node.id.name === traceHandle) {
                      //  generate(epath.node, {}).code
                      // JSON.stringify(epath.node, null, 2)
                      const buildRequire = template(`console.log(%%traceValue%%);`);

                      const ast = buildRequire({
                        traceValue: `'${traceValue}'`,
            
                      });
                      console.log(generate(ast).code);
                    
                      epath.node.init.body = ast
                      fs.writeFile('./message.js', generate(epath.node, {}).code, (err) => {
                        if (err) throw err;
                      });
                    }
                  }
                },

              })
            }
          }
          o.remove()
        }
      }
    },

  });

  traceValue = null
  traceHandle = null
  return generate(result, {}).code
};

```
AST思路：
找到自定义的$trace属性，并且保存起来。然后寻找该JSXOpeningElement属性上是否存在需要埋点的时间。

如果存在则在当前事件里边修改blockstatement。也就是在函数里边注入我们想要的埋点逻辑。

结论：方案确实可行，但是需要考虑太多，需要AST兼容。后续开发负担似乎太重。

