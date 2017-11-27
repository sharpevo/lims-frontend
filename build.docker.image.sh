#!/bin/bash
image_folder="docker"
app="lims-frontend"
timestamp=`date +%Y%m%d_%H%M`
git_commit=`git log -1 --format=%h`
if [ -z "$1" ]
then
    version="test"
else
    version=$1
fi
image_tag=$app:${version}_${timestamp}
image_file=$image_folder/$app.${version}_${timestamp}
build_number="version: \"Build ${git_commit} | ${version} ${timestamp}\","
echo ">>> building app: $build_number"
sed -i -e "s/version.*,/$build_number/" ./src/environments/environment.$version.ts
ng build --environment $version --aot --locale zh-CN --i18n-file src/locale/messages.zh-CN.xlf --i18n-format xlf
echo ">>> building images: $image_tag"
docker build \
    -t $image_tag \
    --build-arg GIT_COMMIT=${git_commit}\
    .
echo ">>> saving images: $image_file"
docker save -o $image_file $image_tag
