#!/bin/bash
########################
# This script will build this maven project with  phases as parameters  
# ex: this script will run "mvn clean install" 
# purpose of this script is perform build this project only! 
# so, feel free to do any custom build tasks for your  project
#######################
if [ -d $MAVEN_HOME ] ; then
    echo "$MAVEN_HOME is being set into path"
	export PATH=$PATH:$MAVEN_HOME/bin
	else
	 exit 1
fi

echo " maven command to run is: ${1}"
if [ "${1}" == "" ]; 
	then
		echo "Running default mvn deploy"
		cd ../TDS.ItemRenderer
		echo " RUNNING MAVEN BUILD "
		mvn clean package
		
elif [ "${1}" == "compile" -o "${1}" == "package" -o "${1}" == "install" -o "${1}" == "deploy" ]
		then
			cd ../Permissions
			echo " RUNNING MAVEN BUILD "
			mvn clean ${1}
	else
		echo "entered wrong maven command"
	exit 1
fi
