const { exec } = require('child_process');
const util = require('util');

var execPromisify = util.promisify(exec);

async function execute(command) {
  let  stdout;
  let  stderr;
  let err
  try {
    const res = await execPromisify(command);
    stdout = res.stdout;
    stderr = res.stderr;
    
  } catch (error) {
    err =  error;
  }
  return { err, stdout, stderr };
}

/**
 * Regex to parse version description into separate fields
 */
descriptionRegex1 = /^v?([\d.]+)-(\d+)-g(\w+)-?(\w+)*/g;
descriptionRegex2 = /^v?([\d.]+-\w+)-(\d+)-g(\w+)-?(\w+)*/g;
descriptionRegex3 = /^v?([\d.]+-\w+\.\d+)-(\d+)-g(\w+)-?(\w+)*/g;

function parseSemanticVersion(description) {
  try {
    const [match, tag, commits, hash] = this.descriptionRegex1.exec(description);

    return {
      match,
      tag,
      commits,
      hash,
    };
  } catch {
    try {
      const [match, tag, commits, hash] = this.descriptionRegex2.exec(description);

      return {
        match,
        tag,
        commits,
        hash,
      };
    } catch {
      try {
        const [match, tag, commits, hash] = this.descriptionRegex3.exec(description);

        return {
          match,
          tag,
          commits,
          hash,
        };
      } catch {
        return false;
      }
    }
  }
}



async function run() {

  let version;
  var res = await execute("git describe --tags");

  if (res.err) {
    //some err occurred
    var index = res.err.message.indexOf("cannot describe anything");
    if (index > 0) {
      version = "v0.0.1";
    }
  } else {
    var data = parseSemanticVersion(res.stdout);
    console.log(data);
    version = data.tag;
  }
  console.log(`the version is: ${version}`);

}

run();
