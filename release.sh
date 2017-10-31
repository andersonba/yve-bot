#!/bin/sh

echo "> Building bundles"
yarn clean
yarn build

echo "> Bumping version to $1"
npm version $1 --no-git-tag-version
VERSION=$(node -p -e "require('./package.json').version")
git tag --annotate --message="Release $VERSION" $VERSION

echo "> Now is $VERSION"

echo "> Publishing to NPM"
cp package.json lib
cd lib
npm publish
cd ..

echo "> Releasing to Git"
git add package.json
git commit -m "Release $VERSION"
git push --follow-tags

echo "> Updating Changelog"
github_changelog_generator --no-unreleased
