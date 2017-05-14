import * as tt from "typescript-definition-tester";

describe('ambient declaration tests', () => {
  it('should compile examples successfully against index.d.ts', (done) => {
    tt.compileDirectory(
      __dirname + '/typescript',
      (fileName) => fileName.indexOf('.ts') > -1,
      {
        jsx: true,
      },
      () => done(),
    );
  });
});
