#!/bin/bash
imageFolder="docker"
app="lims-frontend"
if [ -z "$1" ]
then
    version="test"
else
    version=$1
fi
echo ">>> building app: $version"
ng build --environment $version
echo ">>> building images: $app:$version"
docker build -t $app:$version .
echo ">>> saving images: $app.$version"
docker save -o $imageFolder/$app.$version $app:$version
