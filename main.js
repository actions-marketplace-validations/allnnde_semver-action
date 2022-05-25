const { exec } = require('child_process');
const util = require('util');
const core = require('@actions/core');
const github = require('@actions/github');



var execPromisify = util.promisify(exec);

async function execute(command) {
  let stdout;
  let stderr;
  let err
  try {
    const res = await execPromisify(command);
    stdout = res.stdout;
    stderr = res.stderr;

  } catch (error) {
    core.error(`error executing ${command}: ${error}`);
    err = error;
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
        const commits = description.split(".")[description.split(".").length - 1];
        const  match= description;
        const  tag= description;
        const  hash= "";
        return {
          match,
          tag,
          commits,
          hash,
        };
      }
    }
  }
}



async function run() {

  let version;
  
  core.info(`execute git describe`);
  var res = await execute("git describe --tags");  
  core.info(`execute git describe result: ${res}`);
  if (res.err) {
    //some err occurred
    var index = res.err.message.indexOf("cannot describe anything");
    if (index > 0) {
      version = "0.0.1";
    }
  } else {
    var data = parseSemanticVersion(res.stdout);
    console.log(data);

    var commitMessage = await execute("git log -1 --format=%s");
    var previusliVersion = data.tag.replace("v", "").trim();

    let [major, minor, patch] = previusliVersion.split(".");
    console.log(previusliVersion);
    console.log(major);
    console.log(minor);
    console.log(patch);

    if (commitMessage.stdout.includes("breaking:")) {
      core.info(`the version is major`);
      const num = parseInt(major) + 1;
      major = num;
      minor = 0;
      patch = 0;
    }
    else if (commitMessage.stdout.includes("feature:")) {
      core.info(`the version is minor`);
      const num = parseInt(minor) + 1;
      major = major;
      minor = num;
      patch = 0;
    }
    else {
      core.info(`the version is patch`);
      major = major;
      minor = minor;
      patch = data.commits;
    }
    version = `${major}.${minor}.${patch}`.trim();
  }
  core.setCommandEcho(true);  

  core.info(`the new version is: v1.0.0b`);
  core.setOutput("version", `v1.0.0b`);
  core.info(`the previous version is: v1.0.0b`);
  core.setOutput("previous-version", `v1.0.0b`);
}

run();



