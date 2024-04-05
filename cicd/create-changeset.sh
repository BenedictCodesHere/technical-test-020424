#!/usr/bin/env bash

set -e # Stop the execution of the script if it fails

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="CFN-CHANGESET-CREATE"

colorize() {
  if [ "$1" == "$LABEL" ]; then
    printf "${CYAN}== $1 ${NO_COLOR}\n"
  else
    printf "${CYAN} $1 ${NO_COLOR}\n"
  fi
}

validate_variables() {
  if [ -z "$TEMPLATE_FILE" ] || [ -z "$STACK_NAME" ] || [ -z "$AWS_REGION" ] || [ -z "$CHANGE_SET_NAME" ]; then
    colorize "Error: Missing required variables. TEMPLATE_FILE, STACK_NAME, AWS_REGION, and CHANGE_SET_NAME are mandatory."
    exit 1
  fi
}

validate() {
  colorize "Validating the CloudFormation template..."
  aws cloudformation validate-template --template-body file://"$TEMPLATE_FILE" --region "$AWS_REGION"
}

create_changeset() {
  colorize "Creating the CloudFormation change set..."
  aws cloudformation create-change-set \
      --template-body file://"$TEMPLATE_FILE" \
      --stack-name "$STACK_NAME" \
      --change-set-name "$CHANGE_SET_NAME" \
      --capabilities "CAPABILITY_NAMED_IAM" \
      --region "$AWS_REGION" \
      --parameters ParameterKey=RepositoryName,ParameterValue="$REPOSITORY_NAME"
  colorize "Change set $CHANGE_SET_NAME creation initiated. Please review it in the AWS Console before executing."
}

colorize "$LABEL"

# variables
TEMPLATE_FILE="template.yaml"
STACK_NAME="techtest-020424-cicd-stack"
CHANGE_SET_NAME="my-change-set-$(date +%Y%m%d%H%M%S)" # Unique change set name
AWS_REGION="eu-west-2"
REPOSITORY_NAME="techtest-020424-repo"

validate_variables

colorize "Validating..."
validate

colorize "Creating Change Set..."
create_changeset

colorize "Change Set creation script completed successfully!"
