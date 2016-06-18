'use strict';
const diff = require('diff');
const YAML = require('yamljs');
const Base = require('mocha').reporters.Base;
const utils = require('mocha').utils;

function escapeInvisibles(line) {
  return line.replace(/\t/g, '<tab>')
    .replace(/\r/g, '<CR>')
    .replace(/\n/g, '<LF>\n');
}

function cleanUpDiff(line) {
  if (line.match(/@@/)) {
    return null;
  }
  if (line.match(/\\ No newline/)) {
    return null;
  }
  if (line === '') {
    return null;
  }
  return escapeInvisibles(line);
}

function title(test) {
  return test.fullTitle().replace(/#/g, '');
}

module.exports = function TAP13(runner) {
  Base.call(this, runner);

  let passes = 0;
  let skip = 0;
  let failures = 0;

  let n = 1;
  runner.on('test end', () => n++);

  runner.on('start', () => {
    console.log(`TAP version 13\n1..${runner.grepTotal(runner.suite)}`);
  });

  runner.on('pending', (test) => {
    skip++;
    console.log(`ok ${n} ${title(test)} # SKIP -`);
  });

  runner.on('pass', (test) => {
    passes++;
    console.log(`ok ${n} ${title(test)}`);
  });

  runner.on('fail', (test, err) => {
    failures++;
    console.log(`not ok ${n} ${title(test)}`);
    const message = {
      name: err.name,
      message: err.message,
      file: test.file
    };
    if (err.actual || err.expected) {
      message.actual = utils.stringify(err.actual).split('\n');
      message.expected = utils.stringify(err.expected).split('\n');
    }
    if (err.showDiff) {
      message.diff = diff
        .createPatch('string', utils.stringify(err.actual), utils.stringify(err.expected))
        .split('\n')
        .splice(4)
        .map(cleanUpDiff)
        .filter((line) => line != null);
    }
    console.log('  ---');
    console.log(YAML.stringify(JSON.parse(JSON.stringify(message)), 4).replace(/^/gm, '  '));
    console.log('  ...');
  });

  runner.on('end', () => {
    console.log(`# tests ${passes + failures + skip}`);
    console.log(`# pass ${passes}`);
    console.log(`# fail ${failures}`);
    console.log(`# skip ${skip}`);
  });
};
