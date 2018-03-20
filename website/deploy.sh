#/bin/bash
git config --global user.name "${GH_NAME}"
git config --global user.email "${GH_EMAIL}"
echo "machine github.com login ${GH_NAME} password ${GH_TOKEN}" > ~/.netrc
cd website
rm -rf build
yarn install
yarn build
GIT_USER="${GH_NAME}" yarn publish-gh-pages
