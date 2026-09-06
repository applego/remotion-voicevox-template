const {test} = require('node:test');
const assert = require('node:assert/strict');
// Node >=22.18 executes this erasable TypeScript module without eval/code generation.
const moduleExports = require('../src/video-background-config.ts');
const {normalizeVideoBgConfig: normalize, videoBgDuration: duration, videoBgPositions: positions} = moduleExports;
const segment = {id: 1, durationInFrames: 30, pauseAfter: 0, clip: {src: 'fixture.mp4'}};
test('nested props and flat compatibility resolve identically', () => {
 const config={segments:[segment], layout:'title-stage'};
 assert.deepEqual(normalize({config}), normalize(config));
 assert.deepEqual(normalize({config:{segments:[]}, ...config}), normalize(config));
});
test('duration and shot offsets derive from input rather than quote defaults', () => {
 const config=normalize({config:{segments:[{...segment,pauseAfter:5},{...segment,id:2,durationInFrames:20}]}});
 assert.equal(duration(config),55);
 assert.deepEqual(positions(config).map(x=>x.startFrame),[0,35]);
});
test('stage retains native clip audio without mandatory voice files', () => {
 assert.equal(normalize({config:{segments:[segment],layout:'title-stage'}}).segments[0].voiceFile,undefined);
});
test('malformed or absent stage content is rejected', () => {
 for (const config of [
  {segments:[]},
  {segments:[{...segment,durationInFrames:0}]},
  {segments:[segment,segment]},
  {segments:[{...segment,clip:undefined}],layout:'title-stage'},
  {segments:[segment],captions:[{startFrame:0,endFrame:31,text:'late'}]},
  {segments:[segment],videoSettings:{playbackRate:0}},
  {segments:[segment],stage:{top:1900}},
 ]) assert.throws(()=>normalize({config}));
});

test('legacy global background is continuous while explicit clips remain shot-local', () => {
 const {globalVideoBgSource, segmentVideoBgSource} = moduleExports;
 const legacy={segments:[{id:1,durationInFrames:30,pauseAfter:0}],backgroundVideo:'global.mp4'};
 assert.equal(globalVideoBgSource(legacy),'global.mp4');
 assert.equal(segmentVideoBgSource(legacy,legacy.segments[0]),undefined);
 assert.equal(segmentVideoBgSource(legacy,{...legacy.segments[0],clip:{src:'shot.mp4'}}),'shot.mp4');
 const staged={...legacy,layout:'title-stage'};
 assert.equal(globalVideoBgSource(staged),undefined);
 assert.equal(segmentVideoBgSource(staged,staged.segments[0]),'global.mp4');
});
