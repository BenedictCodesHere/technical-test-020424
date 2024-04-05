#!/usr/bin/env bash

set -e # Stop the execution of the script if it fails

# Enable script debugging
set -x

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="CODECOMMIT-UPLOAD"

colorize() {
  if [ "$1" == "$LABEL" ]; then
    printf "${CYAN}== $1 ${NO_COLOR}\n"
  else
    printf "${CYAN} $1 ${NO_COLOR}\n"
  fi
}

validate_variables() {
  if [ -z "$REPO_NAME" ] || [ -z "$BRANCH_NAME" ] || [ -z "$FUNCTION_FOLDER" ] || [ -z "$TEMPLATE_FILE" ] || [ -z "$BUILDSPEC_FILE" ]; then
    colorize "Error: Missing required variables."
    exit 1
  fi
}
# Function to get the latest commit ID of the branch
get_latest_commit_id() {
  aws codecommit get-branch --repository-name "$REPO_NAME" --branch-name "$BRANCH_NAME" \
    --query 'branch.commitId' --output text
}

upload_file() {
  local file_path=$1
  local full_path="${FUNCTION_FOLDER}/${file_path}"
  local commit_id=$(get_latest_commit_id)

  if [ -f "$full_path" ]; then
    aws codecommit put-file --repository-name "$REPO_NAME" --branch-name "$BRANCH_NAME" --file-path "$file_path" \
      --file-content "file://${full_path}" --parent-commit-id "$commit_id"
    colorize "Uploaded $file_path to $REPO_NAME/$BRANCH_NAME"
  else
    colorize "Error: File $full_path does not exist."
    exit 1
  fi
}

upload_template_and_buildspec() {
  colorize "Uploading the template and buildspec files..."
  local commit_id=$(get_latest_commit_id)

  for file in "$TEMPLATE_FILE" "$BUILDSPEC_FILE"; do
    if [ -f "$file" ]; then
      aws codecommit put-file --repository-name "$REPO_NAME" --branch-name "$BRANCH_NAME" --file-path "$file" \
        --file-content "file://$file" --parent-commit-id "$commit_id"
      colorize "Uploaded $file to $REPO_NAME/$BRANCH_NAME"
    else
      colorize "Error: File $file does not exist."
      exit 1
    fi
  done
}

# upload_file() {
#   local file_path=$1
#   local full_path="${FUNCTION_FOLDER}/${file_path}"
  
#   if [ -f "$full_path" ]; then
#     aws codecommit put-file --repository-name "$REPO_NAME" --branch-name "$BRANCH_NAME" --file-path "$file_path" --file-content "file://${full_path}"
#     colorize "Uploaded $file_path to $REPO_NAME/$BRANCH_NAME"
#   else
#     colorize "Error: File $full_path does not exist."
#     exit 1
#   fi
# }

upload_function_folder() {
  colorize "Uploading the function folder..."
  local file_types=("*.ts" "*.json") # Add any other file types as needed
  for type in "${file_types[@]}"; do
    find "$FUNCTION_FOLDER" -type f -name "$type" | while read -r file; do
      file_path=${file#"$FUNCTION_FOLDER/"}
      upload_file "$file_path"
    done
  done
}

# upload_template_and_buildspec() {
#   colorize "Uploading the template and buildspec files..."
#   for file in "$TEMPLATE_FILE" "$BUILDSPEC_FILE"; do
#     if [ -f "$file" ]; then
#       aws codecommit put-file --repository-name "$REPO_NAME" --branch-name "$BRANCH_NAME" --file-path "$file" --file-content "file://$file"
#       colorize "Uploaded $file to $REPO_NAME/$BRANCH_NAME"
#     else
#       colorize "Error: File $file does not exist."
#       exit 1
#     fi
#   done
# }

colorize "$LABEL"

# variables
REPO_NAME="techtest-020424-repo"
BRANCH_NAME="main"
FUNCTION_FOLDER="../apigw-backend/function"
TEMPLATE_FILE="template.yaml"
BUILDSPEC_FILE="buildspec.yml"

validate_variables
upload_function_folder
upload_template_and_buildspec

colorize "Upload completed successfully!"
