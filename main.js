const { exec } = require('child_process');

/**
 * Regex to parse version description into separate fields
 */
descriptionRegex1 = /^v?([\d.]+)-(\d+)-g(\w+)-?(\w+)*/g;
descriptionRegex2 = /^v?([\d.]+-\w+)-(\d+)-g(\w+)-?(\w+)*/g;
descriptionRegex3 = /^v?([\d.]+-\w+\.\d+)-(\d+)-g(\w+)-?(\w+)*/g;

function parseSemanticVersion(description ) {
  try {
    const [match, tag, commits, hash] = this.descriptionRegex1.exec(description) ;

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
        const [match, tag, commits, hash] = this.descriptionRegex3.exec(description) ;

        return {
          match,
          tag,
          commits,
          hash,
        };
      } catch {
        core.warning(
          `Failed to parse git describe output or version can not be determined through: "${description}".`,
        );
        return false;
      }
    }
  }
}

let version;
exec("git describe --tags", (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    var index = err.message.indexOf("cannot describe anything");
    if (index > 0) {
      version = "0.0.1";
    }
  } else {
    var data = parseSemanticVersion(stdout);
    console.log(data);
    version = stdout;
  }
  console.log(`the version is: ${version}`);
});
