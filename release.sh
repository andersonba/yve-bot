#!/bin/sh
set -e

if ! [ -x "$(command -v dialog)" ]; then
  echo 'Error: dialog is not installed. Run: brew install dialog' >&2
  exit 1
fi

if ! [ -x "$(command -v semver)" ]; then
  echo 'Error: semver is not installed. Run: yarn global add semver' >&2
  exit 1
fi

if ! [ -x "$(command -v json)" ]; then
  echo 'Error: json is not installed. Run: yarn global add json' >&2
  exit 1
fi

if ! [ -x "$(command -v github_changelog_generator)" ]; then
  echo 'Error: github_changelog_generator is not installed. Run: gem install github_changelog_generator' >&2
  exit 1
fi

current_version=$(cat package.json |json version)
next_version=$(semver "$current_version" -i "$1")
dialog --title "Do you release?" --yesno "Current version: $current_version\n\nNext version: $next_version" 0 0

dialog --title "Wait a moment" --infobox "Building the bundles with rollup..." 0 0
yarn clean
yarn build

dialog --title "Bump version" --yesno "Are you right to bump the version to $next_version?" 0 0

dialog --title "Wait a moment" --infobox "Bumping version to $next_version..." 0 0
npm version $1 --no-git-tag-version
git tag --annotate --message="Release $next_version" $next_version

dialog --title "Publish version" --yesno "Are you right to publish version $next_version to registry?" 0 0

dialog --title "Wait a moment" --infobox "Publishing version $next_version to NPM registry..." 0 0
cp package.json lib
cd lib
npm publish
cd ..

dialog --title "Wait a moment" --infobox "Committing the package.json..." 0 0
git add package.json
git commit -m "Release $next_version"

dialog --title "Push commit" --yesno "Are you right to push the tag to repository?" 0 0

dialog --title "Wait a moment" --infobox "Pushing the new tag to Git repository..." 0 0
git push --follow-tags

dialog --title "Wait a moment" --infobox "Updating CHANGELOG.md..." 0 0
github_changelog_generator --no-unreleased

dialog --title "Congratulations!" --msgbox "Version $next_version released!\n\nNow, check the CHANGELOG.md to commit the changes" 0 0
git diff
