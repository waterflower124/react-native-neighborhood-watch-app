#!/bin/bash

./gradlew ${1:-installDevMinSdkDevKernelDebug} --stacktrace && adb shell am start -n com.safetyzone.waterflower/host.exp.exponent.MainActivity
