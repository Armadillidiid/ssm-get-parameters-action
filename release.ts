// import { execSync } from 'child_process';
// import * as readline from 'readline';
//
// // Terminal colors
// const OFF = '\033[0m';
// const BOLD_RED = '\033[1;31m';
// const BOLD_GREEN = '\033[1;32m';
// const BOLD_BLUE = '\033[1;34m';
// const BOLD_PURPLE = '\033[1;35m';
// const BOLD_UNDERLINED = '\033[1;4m';
// const BOLD = '\033[1m';
//
// // Variables
// const semverTagRegex = /^v[0-9]+\.[0-9]+\.[0-9]+$/;
// const semverTagGlob = 'v[0-9].[0-9].[0-9]*';
// const gitRemote = 'origin';
// const majorSemverTagRegex = /^(v[0-9]*)/;
//
// // Function to execute a command and return its output
// function execCommand(command: string): string {
//     try {
//         return execSync(command, { encoding: 'utf-8' }).trim();
//     } catch (error) {
//         console.error(`Error executing command: ${command}`);
//         process.exit(1);
//     }
// }
//
// // 1. Retrieve the latest release tag
// let latestTag: string;
// try {
//     latestTag = execCommand(`git describe --abbrev=0 --match="${semverTagGlob}"`);
// } catch {
//     console.log("No tags found (yet) - Continue to create and push your first tag");
//     latestTag = "[unknown]";
// }
//
// // 2. Display the latest release tag
// console.log(`The latest release tag is: ${BOLD_BLUE}${latestTag}${OFF}`);
//
// // 3. Prompt the user for a new release tag
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// rl.question('Enter a new release tag (vX.X.X format): ', (newTag) => {
//     // 4. Validate the new release tag
//     if (!semverTagRegex.test(newTag)) {
//         console.log(`Tag: ${BOLD_BLUE}${newTag}${OFF} is ${BOLD_RED}not valid${OFF} (must be in ${BOLD}vX.X.X${OFF} format)`);
//         process.exit(1);
//     } else {
//         console.log(`Tag: ${BOLD_BLUE}${newTag}${OFF} is valid syntax`);
//     }
//
//     // 5. Remind user to update the version field in package.json
//     rl.question(`Make sure the version field in package.json is ${BOLD_BLUE}${newTag}${OFF}. Yes? [Y/${BOLD_UNDERLINED}n${OFF}] `, (YN) => {
//         if (!(YN.toLowerCase() === 'y')) {
//             console.log(`Please update the package.json version to ${BOLD_PURPLE}${newTag}${OFF} and commit your changes`);
//             process.exit(1);
//         }
//
//         // 6. Tag a new release
//         execCommand(`git tag "${newTag}" --annotate --message "${newTag} Release"`);
//         console.log(`Tagged: ${BOLD_GREEN}${newTag}${OFF}`);
//
//         // 7. Set 'is_major_release' variable
//         const latestMajorReleaseTag = latestTag.match(majorSemverTagRegex)?.[0];
//         const newMajorReleaseTag = newTag.match(majorSemverTagRegex)?.[0];
//
//         const isMajorRelease = newMajorReleaseTag !== latestMajorReleaseTag;
//
//         // 8. Point separate major release tag (e.g. v1, v2) to the new release
//         if (isMajorRelease) {
//             execCommand(`git tag "${newMajorReleaseTag}" --annotate --message "${newMajorReleaseTag} Release"`);
//             console.log(`New major version tag: ${BOLD_GREEN}${newMajorReleaseTag}${OFF}`);
//         } else {
//             execCommand(`git tag "${latestMajorReleaseTag}" --force --annotate --message "Sync ${latestMajorReleaseTag} tag with ${newTag}"`);
//             console.log(`Synced ${BOLD_GREEN}${latestMajorReleaseTag}${OFF} with ${BOLD_GREEN}${newTag}${OFF}`);
//         }
//
//         // 9. Push the new tags (with commits, if any) to remote
//         execCommand(`git push --follow-tags`);
//
//         if (isMajorRelease) {
//             console.log(`Tags: ${BOLD_GREEN}${newMajorReleaseTag}${OFF} and ${BOLD_GREEN}${newTag}${OFF} pushed to remote`);
//         } else {
//             execCommand(`git push ${gitRemote} "${latestMajorReleaseTag}" --force`);
//             console.log(`Tags: ${BOLD_GREEN}${latestMajorReleaseTag}${OFF} and ${BOLD_GREEN}${newTag}${OFF} pushed to remote`);
//         }
//
//         // 10. If this is a major release, create a 'releases/v#' branch and push
//         if (isMajorRelease) {
//             execCommand(`git branch "releases/${latestMajorReleaseTag}" "${latestMajorReleaseTag}"`);
//             console.log(`Branch: ${BOLD_BLUE}releases/${latestMajorReleaseTag}${OFF} created from ${BOLD_BLUE}${latestMajorReleaseTag}${OFF} tag`);
//             execCommand(`git push --set-upstream ${gitRemote} "releases/${latestMajorReleaseTag}"`);
//             console.log(`Branch: ${BOLD_GREEN}releases/${latestMajorReleaseTag}${OFF} pushed to remote`);
//         }
//
//         // Completed
//         console.log(`${BOLD_GREEN}Done!${OFF}`);
//         rl.close();
//     });
// });
